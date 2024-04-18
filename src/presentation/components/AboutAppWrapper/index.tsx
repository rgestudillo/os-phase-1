import style from "./index.module.scss";
import { ReactComponent as FilePadIcon } from "../../assets/filepad.svg";
import Poster from "../../assets/og-image.webp";
import Preview from "../../assets/preview.gif"; // Import the gift image
export interface AboutAppWrapperProps {
  className?: string;
}

export function AboutAppWrapper({ className }: AboutAppWrapperProps) {
  return (
    <div className={`${className || ""} ${style.container}`}>
      {/* <img
        src={Poster}
        width={2048}
        height={1151}
        alt=""
        style={{ maxWidth: "min(600px, 95%)" }}
      /> */}

      <h1>
        <FilePadIcon
          width={44}
          height={44}
          style={{ float: "left", marginRight: "8px" }}
        />
        <span>Honey OS - Phase 1: DEBMAC&apos;s File Explorer & Editor</span>
      </h1>
      <img
        src={Preview}
        alt="Preview"
        style={{ maxWidth: "min(600px, 95%)", marginBottom: "16px" }}
      />
      <p style={{ maxWidth: "min(600px, 95%)" }}>
        This project encompasses the development of <strong>Honey OS</strong>,
        an operating system aimed at delivering a seamless computing experience.
        It fulfills the <strong> Phase 1</strong> requirements by featuring a
        welcoming screen with the Honey OS logo and creator details, followed by
        essential functionalities like opening new files, opening existing
        files, saving files, saving files as new ones, and closing files, all
        seamlessly integrated into the user interface. With buttons adorned with
        icons and text labels, users can easily identify and execute desired
        actions, with inactive buttons intelligently grayed out to maintain a
        clutter-free interface. Voice commands, complemented by natural language
        processing, enable users to execute operations by speaking commands
        followed by <strong>please</strong> simulating the ENTER key or
        double-clicking a button for intuitive interaction.{" "}
        <strong>Honey OS</strong> embodies accessibility, efficiency, and
        user-friendliness, ensuring a fulfilling computing experience for all
        users.
      </p>
      <h3>Features:</h3>
      <ul style={{ listStyle: "none" }}>
        <li>
          <span style={{ userSelect: "none" }}>☑️ </span>Voice Activated Smart
          File Management
        </li>
        <li>
          <span style={{ userSelect: "none" }}>☑️ </span>Create New Folder and
          File
        </li>
        <li>
          <span style={{ userSelect: "none" }}>☑️ </span>Monaco Editor Supported
        </li>
        <li>
          <span style={{ userSelect: "none" }}>☑️ </span>Download File
        </li>
      </ul>
      <h3>Commands:</h3>
      <ul style={{ listStyle: "none" }}>
        <li>
          <span style={{ userSelect: "none" }}>☑️ </span>{" "}
          <strong>Open file $filename please</strong> - Searches for the
          filename from current directory and opens it.
        </li>
        <li>
          <span style={{ userSelect: "none" }}>☑️ </span>{" "}
          <strong>Close please</strong> - Closes the current active file.
        </li>
        <li>
          <span style={{ userSelect: "none" }}>☑️ </span>{" "}
          <strong>Save please</strong> - Saves the current active file.
        </li>
        <li>
          <span style={{ userSelect: "none" }}>☑️ </span>{" "}
          <strong>Save as please</strong> - Saves the current active file as a
          newfile.
        </li>
        <li>
          <span style={{ userSelect: "none" }}>☑️ </span>{" "}
          <strong>Cut please</strong> - Performs cut operation.
        </li>
        <li>
          <span style={{ userSelect: "none" }}>☑️ </span>{" "}
          <strong>Paste please</strong> - Performs paste operation.
        </li>
        <li>
          <span style={{ userSelect: "none" }}>☑️ </span>{" "}
          <strong>Undo please</strong> - Performs undo operation.
        </li>
        <li>
          <span style={{ userSelect: "none" }}>☑️ </span>{" "}
          <strong>Redo please</strong> - Performs redo operation.
        </li>
      </ul>
      <h3>Authors:</h3>
      <ul style={{ listStyle: "none" }}>
        <li>Dela Fuente, Wince</li>
        <li>Estudillo, Refino Kashi Kyle </li>
        <li>Barina, Kenz Jehu</li>
        <li className={style.strikethrough}>Mojado, John Elias</li>
        <li>Abrau, Lizter Angelo</li>
        <li>Canete, Chris Loui</li>
      </ul>
    </div>
  );
}
