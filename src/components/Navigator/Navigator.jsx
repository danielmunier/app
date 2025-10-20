import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { useNotifications } from "../../hooks/useNotifications";
import {  GiHouse, GiMoon, GiPaintBrush, GiPhotoCamera, GiSun } from "react-icons/gi";
import { BsPin, BsPinFill, BsChevronDown, BsChevronUp, BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { useState } from "react";
import "./Navigator.css";
import { BiChat, BiBell, BiTrash } from "react-icons/bi";
import { FaTasks } from "react-icons/fa";

export default function Navigator({ orientation = "horizontal", position = "bottom" }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const { notifications, unreadCount, removeNotification } = useNotifications();
  const [isPinned, setIsPinned] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleRemoveNotification = (index) => {
    if (notifications[index]) {
      removeNotification(notifications[index].id);
    }
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
          className={`show-navigator-btn ${orientation === "vertical" ? `vertical-${position}` : ""}`}
          title="Mostrar navegador"
        >
          {orientation === "vertical" ? 
            (position === "right" ? <BsChevronLeft /> : <BsChevronRight />) : 
            <BsChevronUp />
          }
        </button>
      )}

      <div className={`cute-nav ${isDarkMode ? "dark" : "light"} ${isHidden ? "hidden" : ""} ${orientation === "vertical" ? "vertical" : "horizontal"} ${position}`}>
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
          onClick={toggleNotifications}
          className="cute-nav-btn notification-toggle"
          title="Notificações"
        >
          <div className="cute-nav-icon">
            <BiBell />
            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
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

      {/* Painel de notificações */}
      {showNotifications && (
        <div className="notification-panel">
          {notifications.length === 0 ? (
            <div className="notification-empty">
              Sem novas notificações
            </div>
          ) : (
            notifications.map((n, i) => (
              <div key={n.id || i} className="notification-item">
                <div className="notification-content">
                  <span className="notification-title">{n.title}</span>
                  {n.message && (
                    <span className="notification-message">{n.message}</span>
                  )}
                  <span className="notification-time">
                    {n.time ? new Date(n.time).toLocaleString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit'
                    }) : 'Agora'}
                  </span>
                </div>
                <button
                  className="notification-delete-btn"
                  title="Remover notificação"
                  onClick={() => handleRemoveNotification(i)}
                >
                  <BiTrash />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}
