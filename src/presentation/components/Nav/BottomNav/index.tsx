import styles from "./index.module.scss";
import { TabBar } from "antd-mobile";
import { useLocation, useNavigate } from "react-router-dom";
import { FolderOutline, ContentOutline, VideoOutline } from "antd-mobile-icons";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
export interface BottomNavProps {
  className?: string;
}

export const BottomNav = ({ className }: BottomNavProps) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const startListeningAndShowTranscript = () => {
    SpeechRecognition.startListening();
  };

  const tabs = [
    {
      key: "/editor",
      title: "Editor",
      icon: <ContentOutline />,
    },

    {
      key: "/explorer",
      title: "Explorer",
      icon: <FolderOutline />,
    },
  ];

  const navigate = useNavigate();
  const { pathname: activePath } = useLocation();

  return (
    <TabBar
      className={`${className ?? ""} ${styles.container}`}
      activeKey={activePath}
      onChange={(path) => navigate(path)}
    >
      <button onClick={startListeningAndShowTranscript}></button>
      <TabBar.Item key="/explorer" icon={<ContentOutline />} title="Explorer" />
      <TabBar.Item key="/editor" icon={<ContentOutline />} title="Editor" />
    </TabBar>
  );
};
