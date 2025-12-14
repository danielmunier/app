import { useNavigate, useLocation } from "react-router-dom";
import { GoHome } from "react-icons/go";
import { BiPhotoAlbum } from "react-icons/bi";
import { IoChatbubbleOutline } from "react-icons/io5";
import { LuListTodo } from "react-icons/lu";
import { HiOutlinePaintBrush } from "react-icons/hi2";
import "./Navigator.css";

export default function Navigator() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navItems = [
    { path: "/", icon: <GoHome /> },
    { path: "/gallery", icon: <BiPhotoAlbum /> },
    { path: "/chat", icon: <IoChatbubbleOutline /> },
    { path: "/tasks", icon: <LuListTodo /> },
    { path: "/draw", icon: <HiOutlinePaintBrush /> },
  ];

  return (
    <div className="nav-wrapper">
      <div className="cute-nav">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`cute-nav-btn ${pathname === item.path ? "active" : ""}`}
          >
            <div className="icon">{item.icon}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
