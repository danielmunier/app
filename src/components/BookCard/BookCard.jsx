import { FaEdit } from "react-icons/fa";
import "./BookCard.css";

export default function BookCard({
  title = "My Album",
  noteNumber = 0,
  image = null,
  onEdit = null,
}) {
  return (
    <div
      className="cute-card"
      style={
        image
          ? {
              backgroundImage: `url(${image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {}
      }
    >
      <div className="cute-footer">
        <div className="cute-info">
          <p className="cute-title">{title}</p>
          <p className="cute-note">Note Number: {noteNumber}</p>
        </div>
        {onEdit && (
          <button 
            className="cute-edit-btn"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(e);
            }}
            title="Editar"
          >
            <FaEdit style={{ fontSize: '14px' }} />
          </button>
        )}
      </div>
    </div>
  );
}
