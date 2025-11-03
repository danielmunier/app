import React from "react";

export default function ProgressBar({ tasks = [] }) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div style={styles.container}>
      <div style={{ ...styles.bar, width: `${percent}%` }} />
      <span style={styles.text}>{percent}% concluído</span>
    </div>
  );
}


const styles = {
  container: {
    position: "relative",
    width: "100%",
    height: "12px",
    borderRadius: "6px",
    background: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
    marginTop: "10px",
  },
  bar: {
    height: "100%",
    background: "linear-gradient(90deg, #b69cff, #e2b8ff)",
    transition: "width 0.4s ease",
  },
  text: {
    position: "absolute",
    top: "-22px",
    right: "0",
    fontSize: "0.8rem",
    color: "rgba(255,255,255,0.8)",
  },
};
