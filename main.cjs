const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
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

function showCustomNotification(title, message) {
  const { width } = screen.getPrimaryDisplay().workAreaSize;

  const notif = new BrowserWindow({
    width: 280,
    height: 140,
    x: width - 300,
    y: 40,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,
    hasShadow: false,
    webPreferences: { contextIsolation: true },
  });

  notif.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(`
      <html>
        <body style="
          margin:0;
          width:100%;
          height:100%;
          background: rgba(0,0,0,0);
          display:flex;
          align-items:center;
          justify-content:center;
          overflow:hidden;
        ">
          <div style="
            border-radius: 32px;
            backdrop-filter: blur(12px);
            padding: 14px 20px;
            width: calc(100% - 18px);
            height: calc(100% - 18px);
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            color: #ff69b4;
            font-family: 'Poppins', 'Comic Sans MS', sans-serif;
            text-align:center;
            animation: fadeIn 0.3s ease-out;
          ">
            <h3 style="margin:0;font-size:15px;">${title} 💫</h3>
            <p style="margin:4px 0 0;font-size:13px;">${message}</p>
          </div>
          <style>
            @keyframes fadeIn {
              from { opacity:0; transform:translateY(-10px); }
              to { opacity:1; transform:translateY(0); }
            }
          </style>
        </body>
      </html>
    `)}`
  );

  notif.once("ready-to-show", () => notif.showInactive());
  setTimeout(() => {
    if (!notif.isDestroyed()) notif.close();
  }, 4000);
}

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
  showCustomNotification('Lori', `Bem-vinda de volta!`);

   win.webContents.openDevTools();
  } else {
 
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

autoUpdater.autoDownload = true; 
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
  console.log('📥 Download progress:', log_message);
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('download-progress', progressObj);
  }
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
