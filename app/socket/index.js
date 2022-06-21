const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const clients = {};

io.use(function (socket, next) {
  var handshakeData = socket.request;
  const userName =
    handshakeData._query["name"] + parseInt(Math.random() * 1000);
  socket.stats = {
    userName: userName,
    clientId: socket.id,
  };
  socket.syncClients = {};
  next();
});

const retryStartingServer = (err) => {
  if (err) {
    console.log(err);
    return setTimeout(() => {
      server.close(() => {
        startSocketServer();
      });
    }, 5 * 60 * 1000);
  }
};

const startSocketServer = (port) => {
  io.on("connection", (socket) => {
    clients[socket.id] = socket;
    console.log("👾 New socket connected! >>", socket.stats);

    socket.on("disconnect", () => {
      const { clientId } = socket.stats;
      console.log("👾 Socket disconnected! >>", socket.stats);
      delete clients[clientId];
      io.emit("onClientDisconnect", clientId);
    });

    socket.on("message", processClientMessage(io, socket));

    processClientConnectBroadcast(io, socket);
  });

  http.listen(port, retryStartingServer);
};

const processClientMessage = (io, currentSocket) => (type, payload) => {
  switch (type) {
    case "onMessage":
      const { message, to } = payload;
      console.log(`sending message "${message}" to client ${to}`);
      io.to(to).emit(type, payload);
      break;
  }
};

const processClientConnectBroadcast = (io, joiningClient) => {
  for (let clientId in clients) {
    const client = clients[clientId];

    // send new user to all the existing users
    if (!client.syncClients[joiningClient.stats.clientId]) {
      client.syncClients[joiningClient.stats.clientId] = joiningClient.stats;
    }
  }
  io.emit("onClientConnect", joiningClient.stats);

  const joiningClientStats = [];
  for (let clientId in clients) {
    const client = clients[clientId];

    // send new user to all the existing users
    if (!joiningClient.syncClients[client.stats.clientId]) {
      joiningClient.syncClients[client.stats.clientId] = client.stats;
      joiningClientStats.push(client.stats);
    }
  }
  joiningClientStats.length &&
    joiningClient.emit("onClientConnect", joiningClientStats);
};

process.on("uncaughtException", function (error) {
  switch (error.code) {
    case "EADDRINUSE":
      return retryStartingServer(error);
    default:
      console.log(error);
  }
});

module.exports = startSocketServer;
