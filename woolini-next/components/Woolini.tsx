"use client";

import styles from "./Woolini.module.css";

type Part = {
  id: string;
  width: number;
  height: number;
  left: number;
  top: number;
  transformOrigin: string;
};

const parts: Part[] = [
  { id: "legLeft", width: 159, height: 158, left: 186, top: 860, transformOrigin: "50% 5%" },
  { id: "legRight", width: 162, height: 157, left: 345, top: 860, transformOrigin: "50% 5%" },
  { id: "body", width: 380, height: 250, left: 150, top: 635, transformOrigin: "50% 50%" },
  { id: "armLeft", width: 141, height: 152, left: 34, top: 645, transformOrigin: "85% 15%" },
  { id: "armRight", width: 143, height: 152, left: 515, top: 644, transformOrigin: "15% 15%" },
  { id: "head", width: 684, height: 634, left: 5, top: 11, transformOrigin: "50% 50%" },
  { id: "eyes", width: 372, height: 85, left: 166, top: 448, transformOrigin: "50% 50%" },
];

export default function Woolini() {
  return (
    <div className={styles.wrap}>
      <div className={styles.stage}>
        {parts.map((p) => (
          <img
            key={p.id}
            id={p.id}
            className={`${styles.part} ${styles[p.id] ?? ""}`}
            src={`/woolini/${p.id}.png`}
            alt=""
            style={{
              width: p.width,
              height: p.height,
              left: p.left,
              top: p.top,
              transformOrigin: p.transformOrigin,
            }}
          />
        ))}
      </div>
    </div>
  );
}
