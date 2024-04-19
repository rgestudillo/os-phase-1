import { useParams } from "react-router-dom";
import { Directory } from "../../../domain/entities/Directory";
import { MonacoEditorWrapper } from "../../components/MonacoEditorWrapper";
import { SideExplorer } from "../../components/SideExplorer";
import { useFolderAdapter } from "../../../adapters/DirectoryAdapter";
import { SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { FolderStatus } from "../../../domain/repositories/DirectoryState";
import { FloatingPanel, FloatingPanelRef } from "antd-mobile";
import { Tabs, TabsProps } from "antd";
import { useWindowSize } from "react-use";
import { SubNav } from "../../components/Nav/SubNav";
import style from "./index.module.scss";
// import { LexicalEditorWrapper } from '../../components/LexicalEditorWrapper'
import { AboutAppWrapper } from "../../components/AboutAppWrapper";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

export function EditorPage() {
  const { parentId, folderId, fileId } = useParams();
  const [command, setCommand] = useState("");
  let workspace: Pick<Directory.FolderMetadata, "parentId" | "id"> =
    Directory.RootNode;

  if (parentId && folderId) {
    workspace = { parentId: parentId, id: folderId };
  }

  const [files, setFiles] = useState<NonNullable<TabsProps["items"]>>([
    {
      key: "-1",
      label: "About",
      children: <AboutAppWrapper />,
    },
    // {
    //   key: '0',
    //   label: 'NotePad',
    //   children: <LexicalEditorWrapper />,
    // }
  ]);

  const [textAreaValue, setTextAreaValue] = useState('');
  // Function to handle changes in textarea
  const handleTextAreaChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    setTextAreaValue(event.target.value);
  };
  const [showInput, setShowInput] = useState(false);
  const handleSaveInput =  async () => {
    if (textAreaValue) {
      const file = await createFile({ name: textAreaValue });
      openFile(file, false);
    }
    setTextAreaValue("");
    setShowInput(false);
  };
  const handleCloseInput =  () => {
    setShowInput(false);
  };

  function speak(text: string | undefined) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      console.error("Speech synthesis not supported in this browser.");
    }
  }
  
  const [activeFileKey, setActiveFileKey] = useState<string>();
  const [unsavedChangesArray, setUnsavedChangesArray] = useState<boolean[]>([]);
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const handleNewFile = async () => {
    speak("Please give me your desired filename");
    setShowInput(true);
    SpeechRecognition.startListening();
  };

  const {
    fetchFolderMetadata,
    fetchFolderContent,
    folderStatus,
    folderMetadata,
    folderContent,
    createFile,
  } = useFolderAdapter(workspace);
  useEffect(fetchFolderMetadata, []);
  useEffect(fetchFolderContent, []);

  useEffect(() => {
    if (!listening) {
      if (transcript.toLowerCase() == "save changes please"){
        handleSaveInput();
      }else if (transcript.toLowerCase().startsWith("file name is")){
        const prefix = "file name is ";
        const extractedFileName = transcript.slice(prefix.length).trim();
        setTextAreaValue(extractedFileName);
        SpeechRecognition.startListening();
      }else if (transcript.toLowerCase() == "yes please"){
        handleModalConfirm();
      }else if(transcript.toLowerCase() == "no please"){
        handleModalCancel();
      }else if (
        (transcript.toLowerCase() === "save as please" ||
          transcript.toLowerCase() === "save us please") &&
        activeFileKey
      ) {
        handleCommand("save as");
      } else if (
        (transcript.toLowerCase() === "cut please" ||
          transcript.toLowerCase() === "cat please") &&
        activeFileKey
      ) {
        handleCommand("cut");
      } else if (
        (transcript.toLowerCase() === "paste please" ||
          transcript.toLowerCase() === "face please") &&
        activeFileKey
      ) {
        handleCommand("paste");
      } else if (transcript.toLowerCase() === "undo please" && activeFileKey) {
        handleCommand("undo");
      } else if (transcript.toLowerCase() === "redo please" && activeFileKey) {
        handleCommand("redo");
      } else if (transcript.toLowerCase() === "save please" && activeFileKey) {
        handleCommand("save");
      } else if (transcript.toLowerCase() === "close please" && activeFileKey) {
        // Call closeFile function to close the active file
        closeFile(activeFileKey);
      } else if (transcript.toLowerCase() === "new file please") {
        handleNewFile();
      } else if (
        transcript.startsWith("open file") &&
        transcript.includes("please")
      ) {
        const [filename] = transcript
          .replace("open file", "") // Remove "open file"
          .split("please") // Split at "please" to get filename
          .map((part) => part.trim())
          .filter(Boolean); // Remove empty strings

        if (filename) {
          let fileFound = false;
          // Loop through folderContent to find the file with the specified filename
          folderContent.forEach((node) => {
            if (
              node.type === Directory.NodeType.file &&
              node.name.toLowerCase() === filename.toLowerCase()
            ) {
              // Open the file
              openFile(node);
              fileFound = true;
            }
          });

          // If the file was not found, show a prompt
          if (!fileFound) {
            alert(`File "${filename}" not found.`);
          }
        } else {
          // Handle case where filename is not provided
          alert("Please specify a filename.");
        }
        // Reset transcript
        resetTranscript();
      }
    }
  }, [listening]);

  const handleCommand = (transcript: string) => {
    // Find the index of the file with activeFileKey
    const fileIndex = files.findIndex((file) => file.key === activeFileKey);

    // If the file with activeFileKey exists, update its state
    if (fileIndex !== -1) {
      // Create a new copy of the files array
      const updatedFiles = [...files];
      // Access the existing file object
      const existingFile = updatedFiles[fileIndex];
      let metadata;

      // Find metadata for the existing file
      folderContent.forEach((node) => {
        if (
          node.type === Directory.NodeType.file &&
          node.id === existingFile.key
        )
          metadata = node;
      });

      const updatedArray = [...unsavedChangesArray];

      if (metadata) {
        console.log("Save command heard: ", metadata);
        // Update the unsavedChangesArray for the specific file to indicate it has been saved
        updatedArray[fileIndex] = false;

        if (command == "save") {
          setUnsavedChangesArray(updatedArray);
        }

        const updatedFile = {
          ...existingFile,
          children: (
            <MonacoEditorWrapper
              transcript={transcript}
              fileMetadata={metadata}
              onUnsavedChanges={(hasUnsavedChanges) => {
                // Update the unsavedChangesArray with the new unsaved changes status
                updatedArray[fileIndex] = hasUnsavedChanges;
                setUnsavedChangesArray(updatedArray);
              }}
            />
          ),
        };
        // Update the files state with the updated array
        updatedFiles[fileIndex] = updatedFile;
        setFiles(updatedFiles);
      }
    }
  };

  const openFile = useMemo(
    () =>
      (file: Directory.FileMetadata, dynamicPosition = true) => {
        const targetIndex = files.findIndex((pane) => pane.key === file.id);
        console.log("opening file: ", file);
        if (targetIndex === -1) {
          // open file next to current active file
          let activeIndex = files.findIndex(
            (pane) => pane.key === activeFileKey
          );
          if (activeIndex === -1 || !dynamicPosition)
            activeIndex = files.length - 1;

          setFiles([
            ...files.slice(0, activeIndex + 1),
            {
              key: file.id,
              label: file.name,
              children: (
                <MonacoEditorWrapper
                  transcript={command}
                  fileMetadata={file}
                  onUnsavedChanges={(hasUnsavedChanges) => {
                    // Update the unsavedChangesArray with the new unsaved changes status
                    const updatedArray = [...unsavedChangesArray];
                    updatedArray[files.length] = hasUnsavedChanges;
                    setUnsavedChangesArray(updatedArray);
                  }}
                />
              ),
            },
            ...files.slice(activeIndex + 1),
          ]);
          // Also update the unsavedChangesArray when opening a new file
          const updatedArray = [...unsavedChangesArray];
          updatedArray[files.length] = false; // Assuming no unsaved changes when opening a new file
          setUnsavedChangesArray(updatedArray);
        }

        setActiveFileKey(file.id);

        return;

        // const uniqueFilesSet = new Set<Directory.FileMetadata>((a, b) => {
        //   if (a.name === b.name) return 0
        //   return a.name > b.name ? 1 : -1
        // })

        // files.forEach(file => uniqueFilesSet.insert(file))
        // uniqueFilesSet.insert(file)
        // const updatedFiles = uniqueFilesSet.toArray

        // // console.log({files, updatedFiles})

        // setFiles(updatedFiles)
        // setOpenedFile(file)
      },
    [files, activeFileKey, unsavedChangesArray]
  );
  const [fileToClose, setFileToClose] = useState(null as unknown as TargetKey);
  const [showModal, setShowModal] = useState(false);
  const handleModalCancel = () => {
    setShowModal(false);
  }


  const handleModalConfirm = () => {
    closeFile(fileToClose);
    setShowModal(false);
  }
  const closeFile = useMemo(
    () => (targetKey: TargetKey) => {
      const targetIndex = files.findIndex((pane) => pane.key === targetKey);

      const newPanes = files.filter((pane) => pane.key !== targetKey);
      
      if (newPanes.length && targetKey === targetKey) {
        const { key } =
          newPanes[
            targetIndex === newPanes.length ? targetIndex - 1 : targetIndex
          ];
        setActiveFileKey(key);
      }
      setFiles(newPanes);

      // Also remove the corresponding element from unsavedChangesArray when closing a file
      const updatedArray = [...unsavedChangesArray];
      updatedArray.splice(targetIndex, 1);
      setUnsavedChangesArray(updatedArray);
      return;
    },
    [files, unsavedChangesArray]
  );

  useEffect(() => {
    folderContent.forEach((node) => {
      if (node.type === Directory.NodeType.file && node.id === fileId)
        openFile(node);
    });
  }, [folderContent.length]);

  const anchors = [100, window.innerHeight * 0.6];
  const ref = useRef<FloatingPanelRef>(null);
  const { width: windowWidth } = useWindowSize();

  const onChange = (key: string) => {
    setActiveFileKey(key);
  };

  const onEdit = async (targetKey: TargetKey, action: "add" | "remove") => {
    if (action === "add") {
      handleNewFile();
    } else {
      const targetIndex = files.findIndex((pane) => pane.key === targetKey);
      setFileToClose(targetKey);
      if (unsavedChangesArray[targetIndex]) {
        speak("You have unsaved changes. Are you sure you want to close the file?");
        SpeechRecognition.startListening();
        setShowModal(true);
      }else{
        closeFile(targetKey);
      }
    }
  };

  if (folderStatus == FolderStatus.Loading) {
    return <p>Loading...</p>;
  }

  if (folderMetadata === undefined) {
    return <p>Could not Find Folder</p>;
  }

  return (
    <div className={style.container}>
      <Modal show={showInput} onHide={handleCloseInput}>
        <Modal.Header closeButton>
          <Modal.Title>File Name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Control as="textarea" rows={1} value={textAreaValue} onChange={handleTextAreaChange}/>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseInput}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveInput}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showModal} onHide={handleModalCancel}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          You have unsaved changes. Are you sure you want to close the file?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleModalConfirm}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>;
      {windowWidth >= 800 ? (
        <SubNav title="DEBMAC's Editor" className={style.sideNav}>
          <SideExplorer workspace={folderMetadata} openFile={openFile} />
        </SubNav>
      ) : (
        <FloatingPanel anchors={anchors} ref={ref}>
          <div style={{ padding: "0 16px 16px 16px" }}>
            <SideExplorer workspace={folderMetadata} openFile={openFile} />
          </div>
        </FloatingPanel>
      )}
      {/* {openedFile && <EditorArea className={style.editorArea} files={files} open={openedFile} openFile={openFile} closeFile={closeFile} />} */}
      <Tabs
        // hideAdd
        className={style.editorArea}
        onChange={onChange}
        activeKey={activeFileKey}
        type="editable-card"
        onEdit={onEdit}
        items={files}
        tabBarGutter={0}
      />
    </div>
  );
}
