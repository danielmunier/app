// main.cjs
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

// Cria a janela principal


// ... resto do código ...

ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});


function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // carrega o front-end (vite dev ou build)
  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "dist/index.html"));
  }

  // win.webContents.openDevTools();

  // Verifica se há atualizações após a janela abrir
  win.once("ready-to-show", () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
}

// App pronto
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Fecha tudo se não for mac
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

/* -------------------- AUTO UPDATER CONFIG -------------------- */

// Isso é opcional — define o repositório explicitamente
autoUpdater.setFeedURL({
  provider: "github",
  owner: "danielmunier", // seu usuário GitHub
  repo: "app",           // nome do repositório
});

// Eventos úteis
autoUpdater.on("update-available", () => {
  console.log("🟢 Atualização disponível! Baixando...");
});

autoUpdater.on("update-not-available", () => {
  console.log("✅ Nenhuma atualização nova encontrada.");
});

autoUpdater.on("error", (err) => {
  console.error("❌ Erro ao buscar atualização:", err);
});

autoUpdater.on("update-downloaded", (info) => {
  console.log("⬇️ Atualização baixada, aplicando...");
  dialog
    .showMessageBox({
      type: "info",
      title: "Atualização disponível",
      message: "Uma nova versão foi baixada. Deseja reiniciar agora para atualizar?",
      buttons: ["Sim", "Mais tarde"],
    })
    .then((result) => {
      if (result.response === 0) autoUpdater.quitAndInstall();
    });
});
