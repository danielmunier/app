import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { GiHouse, GiMoon, GiPaintBrush, GiPhotoCamera, GiSun } from "react-icons/gi";
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

 

  const toggleHidden = () => setIsHidden(!isHidden);

  const navItems = [
    { path: "/", icon: <GiHouse /> },
    { path: "/gallery", icon: <GiPhotoCamera /> },
    { path: "/tasks", icon: <FaTasks /> },
    { path: "/chat", icon: <BiChat /> },
    { path: "/draw", icon: <GiPaintBrush /> },
  ];

  return (
    <div className={`nav-wrapper ${isHidden ? "nav-hidden" : ""}`}>
      <div className="nav">
        <button
          onClick={toggleHidden}
          className="toggle-nav-btn"
          title={isHidden ? "Mostrar navegador" : "Esconder navegador"}
        >
          {isHidden ? <BsChevronUp /> : <BsChevronDown />}
        </button>

        <div className={`cute-nav ${isHidden ? "hidden" : ""} ${isDarkMode ? "dark" : "light"}`}>
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`cute-nav-btn ${pathname === item.path ? "active" : ""}`}
            >
              <div className="cute-nav-icon">{item.icon}</div>
            </button>
          ))}

        

    
        </div>
      </div>
    </div>
  );
}
