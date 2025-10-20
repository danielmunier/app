export default function Sidebar() {
    const sections = [
      { name: "Início", icon: "" },
      
    ];
  
    return (
      <div
        style={{
          background: "#0C0D0E",
          width: "240px",
          height: "90vh",
          position: "fixed",
          borderRadius: "10px",
          left: 0,
          margin: "10px",
          padding: "20px 10px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.5)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
  
        {sections.map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 15px",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#1f1f1f")
            }
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <span>{s.icon}</span>
            <span>{s.name}</span>
          </div>
        ))}
      </div>
    );
  }
  