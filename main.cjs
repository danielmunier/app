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

// Logs simples
autoUpdater.on('update-available', () => {
  console.log('🟢 Atualização disponível!');
});
autoUpdater.on('update-not-available', () => {
  console.log('✅ Nenhuma atualização nova.');
});
autoUpdater.on('update-downloaded', (info) => {
  console.log('⬇️ Atualização baixada!');
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
