import { useEffect, useState } from "react";
import style from "./index.module.scss";
import { NavLinkPersist } from "../../../supports/Persistence";
import { FolderOutline, ContentOutline, VideoOutline } from "antd-mobile-icons";
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
            ? `${style.active} ${style.option}  ${style.button}`
            : `${style.option} ${style.button} `
        }
      >
        <VideoOutline />
      </button>
      <ToastContainer />
    </div>
  );
}
