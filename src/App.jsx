import { useEffect, useState } from 'react'
import './App.css'
import StarryBackground from './components/Background'
import TitleBar from './components/TitleBar'

function App() {
  const [version, setVersion] = useState("")
  const [updateStatus, setUpdateStatus] = useState("") 

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getAppVersion().then((v) => setVersion(v));

      window.electronAPI.onUpdateAvailable(() => {
        setUpdateStatus("🟡 Nova atualização disponível! Baixando...");
      });

      window.electronAPI.onUpdateDownloaded(() => {
        setUpdateStatus("🟢 Atualização baixada! O app será reiniciado...");
        setTimeout(() => {
          window.electronAPI.checkForUpdates(); 
        }, 3000);
      });
    } else {
      setVersion("Web Version");
    }
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <StarryBackground />
      <TitleBar />

      <main
        className="main-app"
        style={{
          position: "absolute",
          top: "30px",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          color: "white",
          textAlign: "center",
          padding: "20px",
          overflowY: "auto",
        }}
      >
        {updateStatus && (
          <div
            style={{
              backgroundColor: "#222",
              border: "1px solid #555",
              padding: "10px 20px",
              borderRadius: 6,
              display: "inline-block",
              marginBottom: 20,
            }}
          >
            {updateStatus}
          </div>
        )}

        <section>testing update for working release workflow</section>

        <div
          style={{
            position: "fixed",
            bottom: 10,
            right: 10,
            color: "#888",
            fontSize: 12,
          }}
        >
          v{version}
        </div>
      </main>
    </div>
  )
}

export default App
