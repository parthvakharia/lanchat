import { useEffect, useState } from "react";
import "./App.css";
import Home from "./components/Home";
import NavBar from "./components/Navbar";
import SocketProvider, { useSocketContext } from "./providers/SocketProvider";

const App = () => {
  const [clientName, setClientName] = useState(null);
  const [networkIP, setNetworkIP] = useState(null);
  const [port, setPort] = useState(null);

  const setClientNameInterval = setInterval(() => {
    var name = document.getElementById("clientName")?.value;
    var ip = document.getElementById("networkIP")?.value;
    var portToConnect = document.getElementById("port")?.value;

    if (name && !clientName) setClientName(name);
    if (ip && !networkIP) setNetworkIP(ip);
    if (portToConnect && !port) setPort(portToConnect);
    if (networkIP && clientName) clearInterval(setClientNameInterval);
  }, 200);

  return (
    <div className="App">
      {clientName && networkIP && port && (
        <SocketProvider clientName={clientName} port={port} ip={networkIP}>
          {/* <NavBar /> */}
          <Home />
        </SocketProvider>
      )}
    </div>
  );
};

export default App;
