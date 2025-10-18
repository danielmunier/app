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

  // ler versões do runtime (útil pra debug)
  versions: {
    chrome: () => process.versions.chrome,
    node: () => process.versions.node,
    electron: () => process.versions.electron,
  },

  // opcional — escutar mensagens de update
  onCheckingForUpdate: (callback) => ipcRenderer.on('checking-for-update', callback),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  onUpdateNotAvailable: (callback) => ipcRenderer.on('update-not-available', callback),
  onUpdateError: (callback) => ipcRenderer.on('update-error', callback),
});
