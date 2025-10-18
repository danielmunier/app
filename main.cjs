const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

// IPC para pegar versão
ipcMain.handle('get-app-version', () => app.getVersion());

// opcional: canal pra updates
ipcMain.on('check-for-updates', () => autoUpdater.checkForUpdatesAndNotify());

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    frame: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // 🧱 mantém segurança
      nodeIntegration: false, // 🚫 não injeta Node no front
    },
  });

  if (!app.isPackaged) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  win.once('ready-to-show', () => {
    win.show();
    autoUpdater.checkForUpdatesAndNotify();
  });

  return win;
}



app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});


ipcMain.on('window-minimize', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.minimize();
});

ipcMain.on('window-maximize', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  }
});

ipcMain.on('window-close', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.close();
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Feed pro autoUpdater (GitHub Releases)
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'danielmunier',
  repo: 'app',
});

// Configurações adicionais do autoUpdater
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

// Logs e eventos do autoUpdater
autoUpdater.on('checking-for-update', () => {
  console.log('🔍 Verificando atualizações...');
});

autoUpdater.on('update-available', (info) => {
  console.log('🟢 Atualização disponível!', info);
});

autoUpdater.on('update-not-available', (info) => {
  console.log('✅ Nenhuma atualização nova.', info);
});

autoUpdater.on('error', (err) => {
  console.error('❌ Erro no auto-updater:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Velocidade de download: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  console.log(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('⬇️ Atualização baixada!', info);
  dialog
    .showMessageBox({
      type: 'info',
      title: 'Atualização disponível',
      message:
        'Uma nova versão foi baixada. Deseja reiniciar agora para atualizar?',
      buttons: ['Sim', 'Mais tarde'],
    })
    .then((result) => {
      if (result.response === 0) autoUpdater.quitAndInstall();
    });
});
