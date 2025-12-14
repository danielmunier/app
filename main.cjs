const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let mainWindow = null;
let notificationWindow = null; // Referência da notificação de hidratação

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

function showCustomNotification(title, message, emoji = "💧") {
  // Se já houver uma notificação aberta, não abre outra
  if (notificationWindow && !notificationWindow.isDestroyed()) {
    return;
  }

  const notifWidth = 320;
  const notifHeight = 150;
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const notif = new BrowserWindow({
    width: notifWidth,
    height: notifHeight,
    x: Math.round((width - notifWidth) / 2),
    y: Math.round((height - notifHeight) / 2),
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,
    hasShadow: false,
    webPreferences: { contextIsolation: true },
  });

  // Guarda referência para poder fechar depois
  notificationWindow = notif;

  notif.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(`
      <html>
        <head>
          <style>
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              background: transparent;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
              font-family: 'Poppins', system-ui, sans-serif;
            }

            .notif {
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              text-align: center;
              backdrop-filter: blur(14px);
              -webkit-backdrop-filter: blur(14px);
              border-radius: 24px;
              color: #fff;
              animation: fadeIn 0.4s ease-out, slideIn 0.5s ease-out;
              position: relative;
            }

            .circle {
              width: 50px;
              height: 50px;
              border-radius: 50%;
              background: rgba(255, 105, 180, 0.8);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 22px;
              color: white;
              box-shadow: 0 4px 10px rgba(255, 105, 180, 0.3);
              margin-bottom: 10px;
              animation: pulse 1.8s infinite ease-in-out;
            }

            h3 {
              margin: 4px 0 4px;
              font-size: 15px;
              font-weight: 500;
              color: #fff;
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            }

            p {
              margin: 0;
              font-size: 12px;
              color: rgba(255, 255, 255, 0.8);
            }

            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }

            @keyframes slideIn {
              from { transform: translateY(-20px) scale(0.97); }
              to { transform: translateY(0) scale(1); }
            }

            @keyframes fadeOut {
              to { opacity: 0; transform: translateY(-10px); }
            }

            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.1); opacity: 0.85; }
            }
          </style>
        </head>
        <body>
          <div class="notif" id="notif">
            <div class="circle">${emoji}</div>
            <h3>${title}</h3>
            <p>${message}</p>
          </div>

          <script>
            // Fecha automaticamente após 3 minutos (180000ms)
            setTimeout(() => {
              const el = document.getElementById('notif');
              el.style.animation = 'fadeOut 0.4s ease forwards';
            }, 179600);
          </script>
        </body>
      </html>
    `)}`
  );

  notif.once("ready-to-show", () => notif.showInactive());

  // Auto-fecha após 3 minutos (180000ms)
  setTimeout(() => {
    if (!notif.isDestroyed()) notif.close();
    if (notificationWindow === notif) notificationWindow = null;
  }, 180000);
}

// Fecha a notificação de hidratação imediatamente
function dismissWaterNotification() {
  if (notificationWindow && !notificationWindow.isDestroyed()) {
    notificationWindow.close();
    notificationWindow = null;
  }
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
  // Configura para iniciar com o Windows
  app.setLoginItemSettings({
    openAtLogin: true,
    path: app.getPath('exe'),
  });

  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});


ipcMain.handle('show-notification', (event, { title, message }) => {
  showCustomNotification(title, message);
});

// Fecha a notificação de hidratação quando o usuário bebe água
ipcMain.handle('dismiss-water-notification', () => {
  dismissWaterNotification();
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
