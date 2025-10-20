import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import {  GiHouse, GiMoon, GiPaintBrush, GiPhotoCamera, GiSun } from "react-icons/gi";
import { BsPin, BsPinFill, BsChevronDown, BsChevronUp } from "react-icons/bs";
import { useState } from "react";
import "./Navigator.css";
import { BiChat } from "react-icons/bi";
import { FaTasks } from "react-icons/fa";

export default function Navigator() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isPinned, setIsPinned] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const handlePin = async () => {
    try {
      const result = await window.electronAPI.windowControl.togglePin();
      setIsPinned(result);
    } catch (error) {
      console.error('Erro ao alternar pin:', error);
    }
  };

  const toggleHidden = () => {
    setIsHidden(!isHidden);
  };

  const navItems = [
    { path: "/", label: "", icon: <GiHouse /> },
    { path: "/gallery", label: "", icon: <GiPhotoCamera /> },
    { path: "/tasks", label: "", icon: <FaTasks /> },
    { path: "/chat", label: "", icon: <BiChat /> },
    { path: "/draw", label: "", icon: <GiPaintBrush /> },
  ];

  return (
    <>
      {/* Botão flutuante para mostrar o Navigator quando estiver escondido */}
      {isHidden && (
        <button
          onClick={toggleHidden}
          className="show-navigator-btn"
          title="Mostrar navegador"
        >
          <BsChevronUp />
        </button>
      )}

      <div className={`cute-nav ${isDarkMode ? "dark" : "light"} ${isHidden ? "hidden" : ""}`}>
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`cute-nav-btn ${
              pathname === item.path ? "active" : ""
            }`}
          >
            <div className="cute-nav-icon">{item.icon}</div>
            <div className="cute-nav-label">{item.label}</div>
          </button>
        ))}
        
        <button
          onClick={handlePin}
          className="cute-nav-btn pin-toggle"
          title={isPinned ? "Desafixar janela" : "Fixar janela"}
        >
          <div className="cute-nav-icon">
            {isPinned ? <BsPinFill /> : <BsPin />}
          </div>
          <div className="cute-nav-label"></div>
        </button>
        
        <button
          onClick={toggleTheme}
          className="cute-nav-btn theme-toggle"
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          <div className="cute-nav-icon">
            {isDarkMode ? <GiSun /> : <GiMoon />}
          </div>
          <div className="cute-nav-label"></div>
        </button>

        <button
          onClick={toggleHidden}
          className="cute-nav-btn hide-toggle"
          title={isHidden ? "Mostrar navegador" : "Esconder navegador"}
        >
          <div className="cute-nav-icon">
            {isHidden ? <BsChevronUp /> : <BsChevronDown />}
          </div>
          <div className="cute-nav-label"></div>
        </button>
      </div>
    </>
  );
}
