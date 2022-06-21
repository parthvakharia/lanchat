import { useEffect, useState } from "react";
import "./App.css";
import Home from "./components/Home";
import NavBar from "./components/Navbar";
import SocketProvider, { useSocketContext } from "./providers/SocketProvider";

const App = () => {
  const [clientName, setClientName] = useState(null);
  const [networkIP, setNetworkIP] = useState(null);
  const [port, setPort] = useState(null);

  useEffect(() => {
    const setClientNameInterval = setInterval(() => {
      var initData = JSON.parse(localStorage.getItem("init")) || {};
      console.log(initData);
      var name =
        initData.clientName || document.getElementById("clientName")?.value;
      var ip =
        initData.networkIP || document.getElementById("networkIP")?.value;
      var portToConnect =
        initData.port || document.getElementById("port")?.value;

      if (name && !clientName) setClientName(name);
      if (ip && !networkIP) setNetworkIP(ip);
      if (portToConnect && !port) setPort(portToConnect);
      if (name && ip && portToConnect) clearInterval(setClientNameInterval);
    }, 300);
  }, []);

  useEffect(() => {
    if (clientName && networkIP && port) {
      const json = { clientName, networkIP, port };
      localStorage.setItem("init", JSON.stringify(json));
    }
  }, [clientName, networkIP, port]);

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
