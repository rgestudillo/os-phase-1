import style from "./index.module.scss";
import { NavLinkPersist } from "../../../supports/Persistence";
import { FolderOutline, ContentOutline, VideoOutline } from "antd-mobile-icons";
import Dictaphone from "../../VoiceToText/index";
export interface SideNavProps {
  className?: string;
}
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

export function SideNav({ className }: SideNavProps) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

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
        onClick={() => SpeechRecognition.startListening()}
        className={
          listening
            ? `${style.active} ${style.option}  ${style.button}`
            : `${style.option} ${style.button} `
        }
      >
        <VideoOutline />
      </button>
      {/* <NavLinkPersist to='/search' title='Search' className={({ isActive }) => isActive ? `${style.active} ${style.option}` : `${style.option}`}><SearchIcon /></NavLinkPersist> */}
      {/* <NavLinkPersist to='/settings' title='Settings' className={({ isActive }) => isActive ? `${style.active} ${style.option}` : `${style.option}`}><SettingsGearIcon /></NavLinkPersist> */}
    </div>
  );
}
