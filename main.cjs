const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let mainWindow = null;

ipcMain.handle('get-app-version', () => app.getVersion());

ipcMain.on('check-for-updates', () => autoUpdater.checkForUpdatesAndNotify());

ipcMain.on('download-update', () => {
  if (autoUpdater.downloadPromise) {
    console.log('Download já em andamento...');
  } else {
    console.log('🔄 Iniciando download da atualização...');
    autoUpdater.downloadUpdate();
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 375,
    height: 667,
    minWidth: 320,
    minHeight: 568,
    frame: false,
    show: false,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,
      contextIsolation: true, 
      nodeIntegration: false, 
    },
  });

  mainWindow = win;

  if (!app.isPackaged) {
    win.loadURL('http://localhost:5173');
   //win.webContents.openDevTools();
  } else {
    // Usar loadURL com file:// para melhor compatibilidade com roteamento
    const indexPath = path.join(__dirname, 'dist/index.html');
    win.loadURL(`file://${indexPath}`);
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

 ipcMain.handle("toggle-pin", () => {
    const isPinned = mainWindow.isAlwaysOnTop();
    mainWindow.setAlwaysOnTop(!isPinned);
    return !isPinned; 
  });

ipcMain.on('window-close', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.close();
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});



autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'danielmunier',
  repo: 'app',
});

autoUpdater.autoDownload = false; 
autoUpdater.autoInstallOnAppQuit = true;

if (!app.isPackaged) {
  autoUpdater.forceDevUpdateConfig = true;
}

autoUpdater.on('checking-for-update', () => {
  console.log('🔍 Verificando atualizações...');
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('checking-for-update');
  }
});

autoUpdater.on('update-available', (info) => {
  console.log('🟢 Atualização disponível!', info);
  if (mainWindow && mainWindow.webContents) {
    const updateInfo = {
      version: info.version,
      releaseName: info.releaseName,
      releaseDate: info.releaseDate
    };
    mainWindow.webContents.send('update-available', updateInfo);
  }
});

autoUpdater.on('update-not-available', (info) => {
  console.log('✅ Nenhuma atualização nova.');
  console.log(info)
  if (mainWindow && mainWindow.webContents) {
    const updateInfo = {
      version: info?.version || 'N/A',
      releaseName: info?.releaseName || 'N/A'
    };
    mainWindow.webContents.send('update-not-available', updateInfo);
  }
});



autoUpdater.on('error', (err) => {
  console.error('❌ Erro no auto-updater:', err);
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('update-error', err.message);
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Velocidade de download: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('⬇️ Atualização baixada!', info);
  if (mainWindow && mainWindow.webContents) {
    const updateInfo = {
      version: info.version,
      releaseName: info.releaseName,
      releaseDate: info.releaseDate
    };
    mainWindow.webContents.send('update-downloaded', updateInfo);
  }
  
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
