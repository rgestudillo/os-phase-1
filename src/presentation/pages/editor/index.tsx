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

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

export function EditorPage() {
  const { parentId, folderId, fileId } = useParams();
  let workspace: Pick<Directory.FolderMetadata, "parentId" | "id"> =
    Directory.RootNode;

  if (parentId && folderId) {
    workspace = { parentId: parentId, id: folderId };
  }

  const [files, setFiles] = useState<NonNullable<TabsProps["items"]>>([
    // {
    //   key: '0',
    //   label: 'NotePad',
    //   children: <LexicalEditorWrapper />,
    // }
  ]);
  const [activeFileKey, setActiveFileKey] = useState<string>();
  const [unsavedChangesArray, setUnsavedChangesArray] = useState<boolean[]>([]);
  const [voiceCommand, setVoiceCommand] = useState("");
  const handleVoiceCommand = (command: SetStateAction<string>) => {
    // Set the voice command received
    setVoiceCommand(command);
  };

  // useEffect to listen for changes in voiceCommand
  useEffect(() => {
    // Check if voiceCommand is "close" and there's an active file
    if (voiceCommand.toLowerCase() === "close" && activeFileKey) {
      // Call closeFile function to close the active file
      closeFile(activeFileKey);
    } else if (voiceCommand.toLowerCase() === "new file") {
      handleNewFile();
    } else if (voiceCommand.startsWith("open file")) {
      const filename = voiceCommand.replace("open file ", "").trim();
      let fileFound = false;
      // Loop through folderContent to find the file with the specified filename
      folderContent.forEach((node) => {
        if (node.type === Directory.NodeType.file && node.name === filename) {
          // Open the file
          openFile(node);
          fileFound = true;
        }
      });

      // If the file was not found, show a prompt
      if (!fileFound) {
        alert(`File "${filename}" not found.`);
      }
    }
    // Reset the voice command
    setVoiceCommand("");
  }, [voiceCommand, activeFileKey]);

  const handleNewFile = async () => {
    const filename = prompt("Enter File Name");
    if (filename) {
      const file = await createFile({ name: filename });
      openFile(file, false);
    }
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

  const openFile = useMemo(
    () =>
      (file: Directory.FileMetadata, dynamicPosition = true) => {
        const targetIndex = files.findIndex((pane) => pane.key === file.id);

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

  const closeFile = useMemo(
    () => (targetKey: TargetKey) => {
      const targetIndex = files.findIndex((pane) => pane.key === targetKey);
      const fileToClose = files[targetIndex];
      const newPanes = files.filter((pane) => pane.key !== targetKey);

      if (unsavedChangesArray[targetIndex]) {
        const confirmClose = window.confirm(
          "You have unsaved changes. Are you sure you want to close the file?"
        );
        if (!confirmClose) {
          return;
        }
      }

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
      const filename = prompt("Enter File Name");
      if (filename) {
        const file = await createFile({ name: filename });
        openFile(file, false);
      }
    } else {
      closeFile(targetKey);
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
      {windowWidth >= 800 ? (
        <SubNav title="DEBMAC's Editor" className={style.sideNav}>
          <button onClick={() => handleVoiceCommand("close")}>
            Simulate Close Command
          </button>
          <button onClick={() => handleVoiceCommand("new file")}>
            Simulate Open Command
          </button>
          <button onClick={() => handleVoiceCommand("open file test.txt")}>
            Simulate Open Command 32
          </button>
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
