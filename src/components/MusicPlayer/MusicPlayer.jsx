import { useState, useRef } from "react";
import { CiPause1, CiPlay1 } from "react-icons/ci";

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div style={styles.player}>
      <img
        src=""
        style={styles.cover}
      />
      <div style={styles.info}>
        <h4 style={styles.title}>Melody, My Love</h4>
        <p style={styles.artist}>Lavy Angel</p>

        <div style={styles.controls}>
          <span style={styles.time}>0:20</span>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progress, width: "40%" }} />
          </div>
          <span style={styles.time}>-0:49</span>
        </div>
      </div>

      <button style={styles.playButton} onClick={togglePlay}>
        {isPlaying ? <CiPause1/>: <CiPlay1/>}
      </button>

      {/* Exemplo de áudio */}
      <audio
        ref={audioRef}
        src="https://cdn.pixabay.com/download/audio/2022/08/31/audio_c5cfab4c27.mp3?filename=soft-piano-melody-11849.mp3"
      />
    </div>
  );
}

const styles = {
  player: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "20px",
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
    padding: "10px 14px",
    width: "300px",
    color: "#fff",
  },
  cover: {
    width: "60px",
    height: "60px",
    borderRadius: "12px",
    objectFit: "cover",
  },
  info: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  title: {
    fontSize: "0.9rem",
    fontWeight: "600",
    margin: 0,
    color: "#fff",
  },
  artist: {
    fontSize: "0.8rem",
    margin: 0,
    opacity: 0.8,
  },
  controls: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  time: {
    fontSize: "0.7rem",
    opacity: 0.7,
  },
  progressBar: {
    flex: 1,
    height: "4px",
    background: "rgba(255,255,255,0.3)",
    borderRadius: "2px",
    overflow: "hidden",
  },
  progress: {
    height: "100%",
    background: "rgba(255,255,255,0.8)",
  },
  playButton: {
    fontSize: "1.4rem",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#fff",
    transition: "transform 0.2s ease",
  },
};
