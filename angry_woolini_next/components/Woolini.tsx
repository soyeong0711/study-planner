"use client";

import styles from "./Woolini.module.css";

export default function Woolini() {
  return (
    <div className={styles.wrap}>
      <div className={styles.stage}>
        <img className={styles.part} src="/woolini/body.png" alt="" />
        <img id="cheek" className={`${styles.part} ${styles.cheek}`} src="/woolini/cheek.png" alt="" />
        <img id="eyes" className={`${styles.part} ${styles.eyes}`} src="/woolini/eyes.png" alt="" />
      </div>
    </div>
  );
}
