const { ipcRenderer } = require("electron");
const { INIT_DATA } = require("./event");

ipcRenderer.on(INIT_DATA, (event, store) => {
  const { IP_TO_CONNECT, COMPUTER_NAME, WEBSOCKET_PORT } = store;
  document.getElementById("clientName").value = COMPUTER_NAME;
  document.getElementById("networkIP").value = IP_TO_CONNECT;
  document.getElementById("port").value = WEBSOCKET_PORT;
});
