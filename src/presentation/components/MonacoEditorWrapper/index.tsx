import style from "./index.module.scss";
import Editor, { OnChange, OnMount } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { Directory } from "../../../domain/entities/Directory";
import ExtensionLanguageMap from "../../../constants/ExtensionLanguageMap";
import {
  useFileAdapter,
  useFolderAdapter,
} from "../../../adapters/DirectoryAdapter";
import { FileStatus } from "../../../domain/repositories/DirectoryState";
import { createFile } from "../../../domain/usecases/File";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCut,
  faPaste,
  faUndo,
  faRedo,
  faSave,
} from "@fortawesome/free-solid-svg-icons";

export interface MonacoEditorProps {
  fileMetadata: Directory.FileMetadata;
  className?: string;
  onUnsavedChanges: (hasUnsavedChanges: boolean) => void; // New prop to notify parent about unsaved changes
  transcript: string; // New prop for transcript
}

export function MonacoEditorWrapper({
  fileMetadata,
  className,
  onUnsavedChanges, // Destructure onUnsavedChanges from props
  transcript,
}: MonacoEditorProps) {
  const { fetchFile, updateContent, fileContent, fileStatus, saveAsNewFile } =
    useFileAdapter(fileMetadata);
  const [editorValue, setEditorValue] = useState("");
  const [initialEditorValue, setInitialEditorValue] = useState("");
  const [isChanged, setIsChanged] = useState(false);
  const [isUndoEnabled, setIsUndoEnabled] = useState(false);
  const [isRedoEnabled, setIsRedoEnabled] = useState(false);
  const [isSavedAsEnabled, setIsSavedAsEnabled] = useState(true);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    fetchFile();
  }, [fetchFile]);

  useEffect(() => {
    if (fileContent) {
      const content = fileContent.content || "";
      setEditorValue(content);
      setInitialEditorValue(content);
    }
  }, [fileContent]);

  useEffect(() => {
    setIsChanged(editorValue !== initialEditorValue);
    // Notify the parent about unsaved changes
    onUnsavedChanges(editorValue !== initialEditorValue);
  }, [editorValue, initialEditorValue]);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleChange: OnChange = (value) => {
    setEditorValue(value || "");
    setIsSavedAsEnabled(false);
  };

  const handleSave = () => {
    console.log("Saving: ", transcript);
    updateContent(editorValue);
    setInitialEditorValue(editorValue);
    setIsChanged(false);
  };

  const handleSaveAs = async () => {
    const filename = prompt("Enter File Name");
    if (filename) {
      saveAsNewFile(filename, editorValue);
    }
  };

  const handleCut = async () => {
    const selection = editorRef.current.getSelection();
    // Check if there is a selection
    if (selection) {
      const selectedText = editorRef.current
        .getModel()
        .getValueInRange(selection);
      // Check if the selected text is not empty
      if (selectedText.trim().length > 0) {
        editorRef.current.trigger("keyboard", "cut", {});
        try {
          await navigator.clipboard.writeText(selectedText);
        } catch (err) {
          console.error("Failed to write to clipboard:", err);
        }
      }
    }
  };

  const handlePaste = async () => {
    console.log("PASTE CALLED");
    console.log(navigator.clipboard);
    if (navigator.clipboard) {
      try {
        const text = await navigator.clipboard.readText();
        const currentPosition = editorRef.current.getPosition();
        editorRef.current.executeEdits("", [
          {
            range: {
              startLineNumber: currentPosition.lineNumber,
              startColumn: currentPosition.column,
              endLineNumber: currentPosition.lineNumber,
              endColumn: currentPosition.column,
            },
            text: text,
          },
        ]);
      } catch (err) {
        console.error("Failed to read clipboard:", err);
      }
    }
  };

  const handleUndo = () => {
    editorRef.current.trigger("keyboard", "undo", {});
  };

  const handleRedo = () => {
    editorRef.current.trigger("keyboard", "redo", {});
  };

  const isFileReady =
    fileContent && fileMetadata && fileStatus !== FileStatus.ContentLoading;
  const extension = "." + (fileMetadata?.name?.split(".")?.reverse()[0] || "");

  useEffect(() => {
    if (editorRef.current) {
      const editorInstance = editorRef.current;
      if (editorInstance) {
        const canUndo = editorInstance.getModel().canUndo();
        const canRedo = editorInstance.getModel().canRedo();
        setIsUndoEnabled(canUndo);
        setIsRedoEnabled(canRedo);
        // You can use 'canUndo' to set the 'isUndoEnabled' state or perform other actions.
      }
    }
  }, [editorValue]);

  useEffect(() => {
    console.log("Went here: ", transcript);
    if (transcript.toLowerCase() === "save as") {
      handleSaveAs();
    } else if (transcript.toLowerCase() === "save") {
      handleSave();
    } else if (transcript.toLowerCase() === "cut") {
      handleCut();
    } else if (transcript.toLowerCase() === "paste") {
      handlePaste();
    } else if (transcript.toLowerCase() === "redo") {
      handleRedo();
    } else if (transcript.toLowerCase() === "undo") {
      handleUndo();
    }
  }, [transcript]);

  return (
    <div className={`${className || ""} ${style.container}`}>
      {isFileReady && (
        <>
          <div className={`${style.rowWrapper} `}>
            <button
              onClick={handleSave}
              className={`${style.saveButton}`}
              disabled={!isChanged}
            >
              <FontAwesomeIcon icon={faSave} />
              Save
            </button>
            <button
              onClick={handleSaveAs}
              className={`${style.saveButton}`}
              disabled={isSavedAsEnabled}
            >
              <FontAwesomeIcon icon={faSave} />
              Save as
            </button>
            <button onClick={handleCut} className={`${style.saveButton}`}>
              <FontAwesomeIcon icon={faCut} />
              Cut
            </button>
            <button onClick={handlePaste} className={`${style.saveButton}`}>
              <FontAwesomeIcon icon={faPaste} />
              Paste
            </button>
            <button
              onClick={handleUndo}
              disabled={!isUndoEnabled}
              className={`${style.saveButton}`}
            >
              <FontAwesomeIcon icon={faUndo} />
              Undo
            </button>
            <button
              onClick={handleRedo}
              disabled={!isRedoEnabled}
              className={`${style.saveButton}`}
            >
              <FontAwesomeIcon icon={faRedo} />
              Redo
            </button>
          </div>

          <Editor
            key={fileMetadata.id}
            value={editorValue}
            defaultLanguage={ExtensionLanguageMap[extension] || "markdown"}
            onChange={handleChange}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{ wordWrap: "on" }}
          />
        </>
      )}
    </div>
  );
}
