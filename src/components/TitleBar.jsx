import "./TitleBar.css";

export default function TitleBar() {

  const handleWindowControl = (action) => {
    if (window.electronAPI?.windowControl) {
      window.electronAPI.windowControl[action]();
    } else {
      console.warn(`Ação ${action} não disponível no ambiente web`);
    }
  };


  return (
    <div className="titlebar">
      <div className="titlebar-left">
        {/* Espaço vazio - notificações movidas para o Navigator */}
      </div>

      <div className="titlebar-right">
        <button
          className="titlebar-btn"
          title="Minimizar"
          onClick={() => handleWindowControl("minimize")}
        >
          &#x2013;
        </button>
        <button
          className="titlebar-btn"
          title="Maximizar"
          onClick={() => handleWindowControl("maximize")}
        >
          ☐
        </button>
        <button
          className="titlebar-btn close"
          title="Fechar"
          onClick={() => handleWindowControl("close")}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
