import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsPin, BsPinFill, BsGear } from "react-icons/bs";
import "./TitleBar.css";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "../hooks/useTheme";

export default function TitleBar() {
  const [isPinned, setIsPinned] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleWindowControl = (action) => {
    if (window.electronAPI?.windowControl) {
      window.electronAPI.windowControl[action]();
    } else {
      console.warn(`Ação ${action} não disponível no ambiente web`);
    }
  };

  const handlePin = async () => {
    try {
      const result = await window.electronAPI.windowControl.togglePin();
      setIsPinned(result);
    } catch (error) {
      console.error("Erro ao alternar pin:", error);
    }
  };

  return (
    <div className="titlebar">
      <div className="titlebar-left">
        <button
          className={`titlebar-btn pin ${isPinned ? "active" : ""}`}
          title={isPinned ? "Desafixar janela" : "Fixar janela"}
          onClick={handlePin}
        >
          {isPinned ? <BsPinFill size={13} /> : <BsPin size={13} />}
        </button>
        <button
          className={`titlebar-btn pin ${isDarkMode ? "active" : ""}`}
          title={isDarkMode ? "Modo claro" : "Modo escuro"}
          onClick={toggleTheme}
        >
          {isDarkMode ? <SunIcon size={13} /> : <MoonIcon size={13} />}
        </button>
        <button
          className="titlebar-btn pin"
          title="Configurações"
          onClick={() => navigate("/settings")}
        >
          <BsGear size={13} />
        </button>
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
