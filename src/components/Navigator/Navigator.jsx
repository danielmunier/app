import { useNavigate, useLocation } from "react-router-dom";
import { GiHouse, GiPaintBrush, GiPhotoCamera } from "react-icons/gi";
import { BiChat, BiPhone, BiPhotoAlbum } from "react-icons/bi";
import { FaTasks } from "react-icons/fa";
import "./Navigator.css";

export default function Navigator() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navItems = [
    { path: "/", icon: <GiHouse /> },
    { path: "/gallery", icon: <BiPhotoAlbum /> },

    // ÍCONE CENTRAL
    { path: "/chat", icon: <BiChat />, isCenter: true },

    { path: "/tasks", icon: <FaTasks /> },
    { path: "/draw", icon: <GiPaintBrush /> },
  ];

  return (
    <div className="nav-wrapper">
      <div className="cute-nav">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`cute-nav-btn ${
              item.isCenter ? "center" : ""
            } ${pathname === item.path ? "active" : ""}`}
          >
            <div className="icon">{item.icon}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
