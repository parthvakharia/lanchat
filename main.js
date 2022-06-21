const os = require("os");
const net = require("net");
const { app, BrowserWindow } = require("electron");
const isDev = require("electron-is-dev");
const path = require("path");
const find = require("local-devices");
const WEBSOCKET_PORT = 9876;
const COMPUTER_NAME = os.hostname();
let IP_TO_CONNECT = "";

const startSocketServer = require("./app/socket");
const { INIT_DATA } = require('./event');

const checkConnection = (host, port, timeout) => {
  return new Promise(function (resolve, reject) {
    timeout = timeout || 10000; // default of 10 seconds
    var timer = setTimeout(function () {
      resolve();
      socket.end();
    }, timeout);
    var socket = net.createConnection(port, host, function () {
      clearTimeout(timer);
      resolve(host);
      socket.end();
    });
    socket.on("error", function (err) {
      clearTimeout(timer);
      resolve();
    });
  });
};

const getCurrentIP = () => {
  const iFaces = os.networkInterfaces();
  let ip = "";
  for (var a in iFaces) {
    for (var b in iFaces[a]) {
      var addr = iFaces[a][b];
      if (addr.family === "IPv4" && !addr.internal) {
        console.log("Network IP: " + addr.address);
        ip = addr.address;
        break;
      }
    }
  }
  return ip;
};

const findActiveWebsocket = async () => {
  try {
    const devices = await find();
    const promises = devices.map(({ ip }) =>
      checkConnection(ip, WEBSOCKET_PORT, 1000)
    );
    const resolvedPromises = await Promise.all(promises);
    return resolvedPromises.find((ip) => ip);
  } catch (e) {
    console.log(e);
  }
};

const createWindow = async () => {
  try {
    const currentIP = getCurrentIP();
    const activeWebsocketIP = await findActiveWebsocket();
    IP_TO_CONNECT = activeWebsocketIP || currentIP;
    if (!activeWebsocketIP) {
      startSocketServer(WEBSOCKET_PORT);
    }
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
      win.webContents.send(INIT_DATA, {
        IP_TO_CONNECT,
        COMPUTER_NAME,
        WEBSOCKET_PORT,
      });
      // { mode: "detach" }
    }
  } catch (e) {
    console.log(e);
  }
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
