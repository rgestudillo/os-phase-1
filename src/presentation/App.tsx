import { SideNav, BottomNav } from "./components/Nav/";
import style from "./App.module.scss";
import { Route, Routes } from "react-router-dom";
import { NavigatePersist } from "./supports/Persistence";
import { EditorPage } from "./pages/editor";
import { ExplorerPage } from "./pages/explorer";
import "antd/dist/reset.css";
import { useWindowSize } from "react-use";
import { useEffect, useState } from "react";
import Preloader from "./Preloader";
import 'bootstrap/dist/css/bootstrap.min.css';
// import {
//   AppOutline,
//   MessageOutline,
//   UnorderedListOutline,
//   UserOutline,
// } from 'antd-mobile-icons'

function App() {
  const { width } = useWindowSize();
  const isWideScreen = width > 600;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 43000); // 40 seconds
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <div>
      {loading ? (
        <div>
          <button
            className={style.customButton}
            onClick={() => {
              console.log("clicked");
              setLoading(false);
            }}
          >
            Click me
          </button>
          <Preloader />
        </div>
      ) : (
        <div className={style.container}>
          {isWideScreen && <SideNav className={style.sideNav} />}
          <main className={style.main}>
            <Routes>
              <Route path="/" element={<NavigatePersist to="/editor" />} />
              <Route path="/editor" element={<EditorPage />} />
              <Route
                path="/editor/:parentId/:folderId"
                element={<EditorPage />}
              />
              <Route
                path="/editor/:parentId/:folderId/:fileId"
                element={<EditorPage />}
              />
              <Route path="/explorer/" element={<ExplorerPage />} />
              <Route
                path="/explorer/:parentId/:folderId"
                element={<ExplorerPage />}
              />
              {/* <Route path='/search' element={<SearchPage />} /> */}
              {/* <Route path='/settings' element={<SettingsPage />} /> */}
            </Routes>
          </main>
          {!isWideScreen && <BottomNav className={style.bottomNav} />}
        </div>
      )}
    </div>
  );
}

export default App;
