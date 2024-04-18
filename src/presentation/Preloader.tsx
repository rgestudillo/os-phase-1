import React from "react";
import style from "./App.module.scss";

const Preloader = () => {
  return (
    <div className={style.customContainer}>
      <video autoPlay loop muted>
        <source src="/npamp4.mp4" type="video/mp4" />
      </video>
    </div>
  );
};

export default Preloader;
