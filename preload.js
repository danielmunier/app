/* eslint-env node */
const { contextBridge, ipcRenderer } = require('electron');



// expõe uma API segura pro front-end
contextBridge.exposeInMainWorld('electronAPI', {
    // ...
  windowControl: {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
  },
  // chama um handler no processo principal
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // pode enviar mensagens pro main se quiser
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  downloadUpdate: () => ipcRenderer.send('download-update'),

  // ler versões do runtime (útil pra debug)
  versions: {
    chrome: () => process.versions.chrome,
    node: () => process.versions.node,
    electron: () => process.versions.electron,
  },

  // opcional — escutar mensagens de update
  onCheckingForUpdate: (callback) => {
    ipcRenderer.removeAllListeners('checking-for-update');
    ipcRenderer.on('checking-for-update', callback);
  },
  onUpdateAvailable: (callback) => {
    ipcRenderer.removeAllListeners('update-available');
    ipcRenderer.on('update-available', (event, ...args) => {
      // Passar apenas os dados, não o evento completo
      callback(...args);
    });
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.removeAllListeners('update-downloaded');
    ipcRenderer.on('update-downloaded', (event, ...args) => {
      callback(...args);
    });
  },
  onUpdateNotAvailable: (callback) => {
    ipcRenderer.removeAllListeners('update-not-available');
    ipcRenderer.on('update-not-available', (event, ...args) => {
      callback(...args);
    });
  },
  onUpdateError: (callback) => {
    ipcRenderer.removeAllListeners('update-error');
    ipcRenderer.on('update-error', (event, ...args) => {
      callback(...args);
    });
  },
});
