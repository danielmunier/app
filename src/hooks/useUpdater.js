import { useEffect, useState, useCallback } from 'react';

export const useUpdater = () => {
  const [version, setVersion] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [newVersion, setNewVersion] = useState("");

  // Função para limpar listeners
  const cleanupListeners = useCallback(() => {
    if (window.electronAPI) {
      // Remover todos os listeners existentes
      window.electronAPI.onCheckingForUpdate(() => {});
      window.electronAPI.onUpdateAvailable(() => {});
      window.electronAPI.onUpdateDownloaded(() => {});
      window.electronAPI.onUpdateNotAvailable(() => {});
      window.electronAPI.onUpdateError(() => {});
    }
  }, []);

  // Função para configurar listeners
  const setupListeners = useCallback(() => {
    if (!window.electronAPI) return;

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
        const newVer = info?.version || info?.releaseName || 'Nova versão';
        setNewVersion(newVer);
        setUpdateStatus(`🟡 Nova atualização disponível! (v${newVer}) Baixando...`);
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
      } else if (errorMessage.includes('404')) {
        errorMessage = 'Arquivo de atualização não encontrado no servidor';
      }
      
      setUpdateStatus(`❌ Erro: ${errorMessage}`);
      setUpdateAvailable(false);
      setIsCheckingUpdate(false);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [updateAvailable]);

  // Função para verificar atualizações
  const checkForUpdates = useCallback(() => {
    if (window.electronAPI && !isCheckingUpdate) {
      console.log('🔍 Verificação manual iniciada');
      window.electronAPI.checkForUpdates();
    }
  }, [isCheckingUpdate]);

  // Inicialização
  useEffect(() => {
    if (window.electronAPI) {
      // Obter versão atual
      window.electronAPI.getAppVersion().then((v) => setVersion(v));
      
      // Configurar listeners
      const cleanup = setupListeners();
      
      // Verificar atualizações automaticamente apenas uma vez
      window.electronAPI.checkForUpdates();

      return () => {
        if (cleanup) cleanup();
        cleanupListeners();
      };
    } else {
      setVersion("Web Version");
      setUpdateStatus("🌐 Modo Web - Atualizações automáticas não disponíveis");
    }
  }, []); // Remover dependências para evitar re-execução

  // Função para iniciar download manual
  const downloadUpdate = useCallback(() => {
    if (window.electronAPI && updateAvailable) {
      console.log('🔄 Iniciando download manual...');
      window.electronAPI.downloadUpdate();
    }
  }, [updateAvailable]);

  return {
    version,
    updateStatus,
    isCheckingUpdate,
    updateAvailable,
    newVersion,
    checkForUpdates,
    downloadUpdate
  };
};
