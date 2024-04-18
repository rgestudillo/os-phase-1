import { useEffect, useState } from "react";
import style from "./index.module.scss";
import { NavLinkPersist } from "../../../supports/Persistence";
import { FolderOutline, ContentOutline, AudioOutline } from "antd-mobile-icons";
import Dictaphone from "../../VoiceToText/index";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export interface SideNavProps {
  className?: string;
}

export function SideNav({ className }: SideNavProps) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const notify = () => toast(`Transcript is: ${transcript}`);

  // Function to start listening and show transcript
  const startListeningAndShowTranscript = () => {
    SpeechRecognition.startListening();
  };

  // Listen for changes in listening state to trigger toast notification
  useEffect(() => {
    if (transcript) {
      notify();
    }
  }, [listening]);

  // Handle keyboard shortcut Ctrl + `
  const handleKeyDown = (event: { ctrlKey: any; key: string }) => {
    if (event.ctrlKey && event.key === "`") {
      startListeningAndShowTranscript();
    }
  };

  // Add event listener for keydown events
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // Empty dependency array to ensure the effect runs only once

  return (
    <div className={`${className ?? ""} ${style.container}`}>
      <NavLinkPersist
        to="/editor"
        title="Editor"
        className={({ isActive }) =>
          isActive ? `${style.active} ${style.option}` : `${style.option}`
        }
      >
        <ContentOutline />
      </NavLinkPersist>
      <NavLinkPersist
        to="/explorer"
        title="Explorer"
        className={({ isActive }) =>
          isActive ? `${style.active} ${style.option}` : `${style.option}`
        }
      >
        <FolderOutline />
      </NavLinkPersist>
      <button
        onClick={startListeningAndShowTranscript}
        className={
          listening
            ? `${style.listenActive} ${style.option}  ${style.button}`
            : `${style.option} ${style.button} `
        }
      >
        <AudioOutline />
      </button>
      <ToastContainer />
    </div>
  );
}
