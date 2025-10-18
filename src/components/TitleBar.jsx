export default function TitleBar() {
  const handleMinimize = () => {
    window.electronAPI.windowControl.minimize();
  };

  const handleMaximize = () => {
    window.electronAPI.windowControl.maximize();
  };

  const handleClose = () => {
    window.electronAPI.windowControl.close();
  };

  return (
    <div
      style={{
        height: "30px",
        width: "100%",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        background: "rgba(0,0,0,0.3)",
        WebkitAppRegion: "drag",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 20,
      }}
    >
      <div style={{ display: "flex", gap: "8px", marginRight: "10px" }}>
        <button onClick={handleMinimize} style={buttonStyle} title="Minimizar">
          –
        </button>
        <button onClick={handleMaximize} style={buttonStyle} title="Maximizar">
          □
        </button>
        <button
          onClick={handleClose}
          style={{ ...buttonStyle, color: "#ff5555" }}
          title="Fechar"
        >
          ×
        </button>
      </div>
    </div>
  );
}

const buttonStyle = {
  width: "28px",
  height: "28px",
  background: "transparent",
  border: "none",
  color: "white",
  fontSize: "16px",
  cursor: "pointer",
  WebkitAppRegion: "no-drag",
};
