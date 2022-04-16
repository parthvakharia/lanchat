const os = require("os");
const computerName = os.hostname();
const ifaces = os.networkInterfaces();
let networkIP = null;

for (var a in ifaces) {
  for (var b in ifaces[a]) {
    var addr = ifaces[a][b];
    if (addr.family === "IPv4" && !addr.internal) {
      console.log("Network IP: " + addr.address);
      networkIP = addr.address;
      break;
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("clientName").value = computerName;
  document.getElementById("networkIP").value = networkIP;
});
