import { useEffect, useState, createContext, useContext, useRef } from "react";
import { io } from "socket.io-client";
const ON_CLIENT_CONNECT = "onClientConnect";
const ON_CLIENT_DISCONNECT = "onClientDisconnect";
const ON_MESSAGE = "onMessage";

const SocketContext = createContext();
const { Provider } = SocketContext;

const SocketProvider = ({ clientName, port, ip, children }) => {
  const [clients, setClients] = useState({});
  const [socket, setSocket] = useState(null);

  const isListenerSetup = (type) => {
    return !!(socket?._callbacks && socket?._callbacks[`$${type}`]);
  };

  const onClientConnectHandler = (client) => {
    if (client instanceof Array) {
      let clientsToUpdate = {};
      for (let i = 0; i < client.length; i++) {
        const currentClient = client[i];
        if (!clients[currentClient.clientId]) {
          clientsToUpdate[currentClient.clientId] = currentClient;
        }
      }
      setClients({
        ...clients,
        ...clientsToUpdate,
      });
    } else {
      if (!clients[client.clientId]) {
        setClients({
          ...clients,
          [client.clientId]: client,
        });
      }
    }
  };

  const sendMessage = (message, sendTo) => {
    const currentClientId = getCurrentClientId();
    const client = clients[sendTo];
    const payload = {
      message,
      to: sendTo,
      from: currentClientId,
      read: false,
      timestamp: new Date().toISOString(),
    };

    if (!client.messageReceived) client.messageReceived = {};
    if (!client.messageReceived[currentClientId])
      client.messageReceived[currentClientId] = [];

    client.messageReceived[currentClientId].push(payload);
    setClients({ ...clients });
    socket.send("onMessage", payload);
  };

  const onClientDisconnectHandler = (clientId) => {
    delete clients[clientId];
    setClients({ ...clients });
  };

  const onReceiveMessageHandler = (payload) => {
    const { from } = payload;
    const client = clients[from];

    if (!client.messageReceived) client.messageReceived = {};
    if (!client.messageReceived[from]) client.messageReceived[from] = [];

    client.messageReceived[from].push(payload);
    setClients({ ...clients });
  };

  useEffect(() => {
    if (ip && port) {
      const socket = io(`ws://${ip}:${port}`, {
        transports: ["websocket"],
        query: `name=${clientName}`,
      });
      setSocket(socket);
    } else {
      console.log(`Cannot initialize socket with ip=${ip} and port=${port}`);
    }
  }, [ip, port]);

  useEffect(() => {
    if (!socket) return;

    if (!isListenerSetup(ON_CLIENT_CONNECT))
      socket.on(ON_CLIENT_CONNECT, onClientConnectHandler);

    if (!isListenerSetup(ON_CLIENT_DISCONNECT))
      socket.on(ON_CLIENT_DISCONNECT, onClientDisconnectHandler);

    if (!isListenerSetup(ON_MESSAGE))
      socket.on(ON_MESSAGE, onReceiveMessageHandler);

    return () => {
      socket.off(ON_CLIENT_CONNECT);
      socket.off(ON_CLIENT_DISCONNECT);
      socket.off(ON_MESSAGE);
    };
  }, [socket, clients]);

  const getCurrentClientId = () => {
    return socket.id;
  };

  return (
    <Provider
      value={{ clients, socket, setClients, sendMessage, getCurrentClientId }}
    >
      {Object.keys(clients).length > 0 ? children : "No connected users"}
    </Provider>
  );
};

export default SocketProvider;
export const useSocketContext = () => useContext(SocketContext);
