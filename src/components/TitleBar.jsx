
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
        height: "50px",
        width: "100%",
        display: "flex",
        alignItems: "center",
        padding: "10px",
        WebkitAppRegion: "drag",
        position: "relative",
        zIndex: 20,
      }}
    >
      {/* Controles de janela - lado esquerdo */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={handleClose}
          style={{ ...buttonStyle, color: "#ff5555" }}
          title="Fechar"
        >
          ×
        </button>
        <button onClick={handleMaximize} style={buttonStyle} title="Maximizar">
          □
        </button>
        <button onClick={handleMinimize} style={buttonStyle} title="Minimizar">
          –
        </button>
      </div>
      
      {/* Controles de aplicação - lado direito */}
      {/* <div style={{ display: "flex", gap: "8px", marginLeft: "auto", marginRight: "10px" }}>
        <button 
          onClick={handlePin} 
          style={{ 
            ...buttonStyle, 
            color: isPinned ? "#4CAF50" : "white" 
          }} 
          title={isPinned ? "Desafixar" : "Fixar"}
        >
          <BsPin />
        </button>
        <button onClick={handleTheme} style={buttonStyle} title="Tema">
          {isDarkMode ? <BsMoonFill /> : <BsSunFill />}
        </button>
      </div> */}
    </div>
  );
}
const buttonStyle = {
  width: "28px",
  background: "transparent",
  border: "none",
  color: "white",
  fontSize: "18px",
  cursor: "pointer",
  WebkitAppRegion: "no-drag",
  outline: "none",
  "&:focus": {
    outline: "none",
  },
  "&:active": {
    outline: "none",
  },
};

