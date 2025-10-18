import { useEffect, useState } from 'react'
import './App.css'
import StarryBackground from './components/Background'
import TitleBar from './components/TitleBar'

function App() {
  const [version, setVersion] = useState("")
  const [updateStatus, setUpdateStatus] = useState("")
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false) 

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getAppVersion().then((v) => setVersion(v));

      // Verificar atualizações ao carregar
      setIsCheckingUpdate(true);
      window.electronAPI.checkForUpdates();

      window.electronAPI.onUpdateAvailable(() => {
        setUpdateStatus("🟡 Nova atualização disponível! Baixando...");
        setUpdateAvailable(true);
        setIsCheckingUpdate(false);
      });

      window.electronAPI.onUpdateDownloaded(() => {
        setUpdateStatus("🟢 Atualização baixada! O app será reiniciado...");
        setUpdateAvailable(true);
        setTimeout(() => {
          window.electronAPI.checkForUpdates();
        }, 3000);
      });

      // Adicionar timeout para parar o loading
      setTimeout(() => {
        if (!updateAvailable) {
          setIsCheckingUpdate(false);
          setUpdateStatus("✅ Você está usando a versão mais recente!");
        }
      }, 5000);
    } else {
      setVersion("Web Version");
      setUpdateStatus("🌐 Modo Web - Atualizações automáticas não disponíveis");
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
        <div
          style={{
            backgroundColor: updateAvailable ? "#2a4a2a" : "#2a2a2a",
            border: `1px solid ${updateAvailable ? "#4a7c4a" : "#555"}`,
            padding: "15px 25px",
            borderRadius: 8,
            display: "inline-block",
            marginBottom: 20,
            minWidth: "300px",
            textAlign: "center",
            boxShadow: updateAvailable ? "0 0 10px rgba(74, 124, 74, 0.3)" : "none",
          }}
        >
          {isCheckingUpdate && (
            <div style={{ marginBottom: 10 }}>
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  border: "2px solid #555",
                  borderTop: "2px solid #646cff",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  display: "inline-block",
                  marginRight: "10px",
                }}
              />
              Verificando atualizações...
            </div>
          )}
          
          {updateStatus && (
            <div style={{ fontSize: "14px", lineHeight: "1.4" }}>
              {updateStatus}
            </div>
          )}

          {updateAvailable && (
            <div style={{ marginTop: 10, fontSize: "12px", opacity: 0.8 }}>
              Uma janela de confirmação aparecerá quando a atualização estiver pronta
            </div>
          )}
        </div>

        <section>
          <h2>🔄 Sistema de Atualizações</h2>
          <p>O app verifica automaticamente por atualizações ao iniciar.</p>
          
          {window.electronAPI && (
            <button
              onClick={() => {
                setIsCheckingUpdate(true);
                setUpdateStatus("");
                window.electronAPI.checkForUpdates();
              }}
              style={{
                backgroundColor: "#646cff",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                marginTop: "10px",
                fontSize: "14px",
              }}
            >
              🔍 Verificar Atualizações Agora
            </button>
          )}
        </section>

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
