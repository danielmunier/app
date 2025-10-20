import { useEffect, useState, useCallback, useRef } from 'react';

export const useUpdater = () => {
  const [version, setVersion] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [newVersion, setNewVersion] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const checkIntervalRef = useRef(null);
  const hasInitializedRef = useRef(false);

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

  const setupListeners = useCallback(() => {
    if (!window.electronAPI) return;

    let timeoutId = null;

    const setupTimeout = () => {
      timeoutId = setTimeout(() => {
        setIsCheckingUpdate(false);
        if (!updateAvailable) {
          setUpdateStatus("⏰ Timeout - Verificação demorou muito. Tente novamente.");
        }
      }, 10000); 
    };

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
        setIsDownloading(true);
      });

    window.electronAPI.onUpdateDownloaded((info) => {
      console.log('⬇️ Atualização baixada!', info);
      clearTimeout(timeoutId);
      setUpdateStatus("🟢 Atualização baixada! O app será reiniciado...");
      setUpdateAvailable(true);
      setIsCheckingUpdate(false);
      setIsDownloading(false);
    });

    window.electronAPI.onUpdateNotAvailable((info) => {
      console.log('✅ Nenhuma atualização nova.', info);
      clearTimeout(timeoutId);
      setUpdateStatus("✅ Você está usando a versão mais recente!");
      setUpdateAvailable(false);
      setIsCheckingUpdate(false);
      setIsDownloading(false);
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
      setIsDownloading(false);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [updateAvailable]);

  const checkForUpdates = useCallback(() => {
    if (window.electronAPI && !isCheckingUpdate) {
      console.log('🔍 Verificação manual iniciada');
      window.electronAPI.checkForUpdates();
    }
  }, [isCheckingUpdate]);


  useEffect(() => {
    if (window.electronAPI && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      
      window.electronAPI.getAppVersion().then((v) => setVersion(v));
      
      const cleanup = setupListeners();
      
      // Verificar imediatamente
      console.log('🔍 Verificação inicial de atualizações');
      window.electronAPI.checkForUpdates();
      
      // Configurar verificação periódica a cada 15 minutos
      console.log('🔄 Iniciando verificação periódica de atualizações (a cada 15 minutos)');
      checkIntervalRef.current = setInterval(() => {
        console.log('🔄 Verificação periódica de atualizações');
        window.electronAPI.checkForUpdates();
      }, 15 * 60 * 1000); // 15 minutos

      return () => {
        if (cleanup) cleanup();
        cleanupListeners();
        if (checkIntervalRef.current) {
          console.log('⏹️ Parando verificação periódica de atualizações');
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
      };
    } else if (!window.electronAPI) {
      setVersion("Web Version");
      setUpdateStatus("🌐 Modo Web - Atualizações automáticas não disponíveis");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executa apenas uma vez 

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
    isDownloading,
    checkForUpdates,
    downloadUpdate
  };
};
