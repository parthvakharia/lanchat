const { app, BrowserWindow } = require("electron");
const isDev = require("electron-is-dev");
const path = require("path");
const startSocketServer = require("./app/socket");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const loadFrontEndFrom = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "./views/build/index.html")}`;
  win.loadURL(loadFrontEndFrom);

  if (isDev) {
    win.webContents.openDevTools();
    // { mode: "detach" }
  }

  startSocketServer();
};

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
