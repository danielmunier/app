const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // ... (tudo o que você já tinha)
  windowControl: {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
    togglePin: () => ipcRenderer.invoke('toggle-pin'),
  },
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  downloadUpdate: () => ipcRenderer.send('download-update'),

  // Notificação de hidratação
  showNotification: (title, message) =>
    ipcRenderer.invoke('show-notification', { title, message }),
  dismissWaterNotification: () =>
    ipcRenderer.invoke('dismiss-water-notification'),

  versions: {
    chrome: () => process.versions.chrome,
    node: () => process.versions.node,
    electron: () => process.versions.electron,
  },

  onCheckingForUpdate: (callback) => {
    ipcRenderer.removeAllListeners('checking-for-update');
    ipcRenderer.on('checking-for-update', callback);
  },
  onUpdateAvailable: (callback) => {
    ipcRenderer.removeAllListeners('update-available');
    ipcRenderer.on('update-available', (event, ...args) => callback(...args));
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.removeAllListeners('update-downloaded');
    ipcRenderer.on('update-downloaded', (event, ...args) => callback(...args));
  },
  onUpdateNotAvailable: (callback) => {
    ipcRenderer.removeAllListeners('update-not-available');
    ipcRenderer.on('update-not-available', (event, ...args) => callback(...args));
  },
  onUpdateError: (callback) => {
    ipcRenderer.removeAllListeners('update-error');
    ipcRenderer.on('update-error', (event, ...args) => callback(...args));
  },
});
