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

      // Timeout de segurança para parar o loading
      let timeoutId = null;

      const setupTimeout = () => {
        timeoutId = setTimeout(() => {
          setIsCheckingUpdate(false);
          if (!updateAvailable) {
            setUpdateStatus("⏰ Timeout - Verificação demorou muito. Tente novamente.");
          }
        }, 15000); // 15 segundos
      };

      // Event listeners para atualizações
      window.electronAPI.onCheckingForUpdate(() => {
        console.log('🔍 Verificando atualizações...');
        setIsCheckingUpdate(true);
        setUpdateStatus("🔍 Verificando atualizações...");
        setUpdateAvailable(false);
        setupTimeout();
      });

      window.electronAPI.onUpdateAvailable((info) => {
        console.log('🟢 Atualização disponível!', info);
        clearTimeout(timeoutId);
        const version = info?.version || 'Nova versão';
        setUpdateStatus(`🟡 Nova atualização disponível! (v${version}) Baixando...`);
        setUpdateAvailable(true);
        setIsCheckingUpdate(false);
      });

      window.electronAPI.onUpdateDownloaded((info) => {
        console.log('⬇️ Atualização baixada!', info);
        clearTimeout(timeoutId);
        setUpdateStatus("🟢 Atualização baixada! O app será reiniciado...");
        setUpdateAvailable(true);
        setIsCheckingUpdate(false);
      });

      window.electronAPI.onUpdateNotAvailable((info) => {
        console.log('✅ Nenhuma atualização nova.', info);
        clearTimeout(timeoutId);
        setUpdateStatus("✅ Você está usando a versão mais recente!");
        setUpdateAvailable(false);
        setIsCheckingUpdate(false);
      });

      window.electronAPI.onUpdateError((error) => {
        console.error('❌ Erro na verificação de atualizações:', error);
        clearTimeout(timeoutId);
        
        let errorMessage = 'Erro desconhecido';
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error && typeof error === 'object') {
          errorMessage = error.message || error.toString();
        }
        
        // Tratar erros específicos
        if (errorMessage.includes('ENOENT')) {
          errorMessage = 'Arquivo de configuração não encontrado';
        } else if (errorMessage.includes('network')) {
          errorMessage = 'Erro de conexão com o servidor';
        } else if (errorMessage.includes('timeout')) {
          errorMessage = 'Timeout na verificação de atualizações';
        }
        
        setUpdateStatus(`❌ Erro: ${errorMessage}`);
        setUpdateAvailable(false);
        setIsCheckingUpdate(false);
      });

      // Verificar atualizações apenas uma vez ao carregar
      window.electronAPI.checkForUpdates();

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
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
                if (isCheckingUpdate) return; // Evitar múltiplas verificações
                console.log('🔍 Verificação manual iniciada');
                window.electronAPI.checkForUpdates();
              }}
              disabled={isCheckingUpdate}
              style={{
                backgroundColor: isCheckingUpdate ? "#555" : "#646cff",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: isCheckingUpdate ? "not-allowed" : "pointer",
                marginTop: "10px",
                fontSize: "14px",
                opacity: isCheckingUpdate ? 0.6 : 1,
              }}
            >
              {isCheckingUpdate ? "🔄 Verificando..." : "🔍 Verificar Atualizações Agora"}
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
