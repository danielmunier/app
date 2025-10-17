const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    frame: false, // custom title bar
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

// App ready
app.whenReady().then(() => {
  createWindow();

  // Auto-update
  autoUpdater.checkForUpdatesAndNotify();
});

// Eventos do auto-updater
autoUpdater.on('checking-for-update', () => {
  console.log('Verificando atualizações...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Nova atualização disponível!', info.version);
});

autoUpdater.on('update-not-available', () => {
  console.log('Nenhuma atualização disponível');
});

autoUpdater.on('error', (err) => {
  console.error('Erro no auto-update:', err);
});

autoUpdater.on('download-progress', (progress) => {
  console.log(`Baixando: ${Math.floor(progress.percent)}%`);
});

autoUpdater.on('update-downloaded', () => {
  const result = dialog.showMessageBoxSync(mainWindow, {
    type: 'info',
    buttons: ['Reiniciar', 'Depois'],
    title: 'Atualização disponível',
    message: 'Nova versão baixada. Reinicie para aplicar.',
  });

  if (result === 0) autoUpdater.quitAndInstall();
});

// Fechar app
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
