import "@xterm/xterm/css/xterm.css";
import { Terminal as XTermimal } from "@xterm/xterm";
import { useEffect, useRef, useState } from "react";
import useSocket from "../hooks/useSocket";
import { debounce } from "../utils/utils";

const Terminal = () => {
  const [terminalText, setTerminalText] = useState("");
  const xtermRef = useRef(null);
  const socket = useSocket("http://localhost:9000");

  useEffect(() => {
    if (!socket) return;

    const xterm = new XTermimal({ rows: 20 });
    xterm.open(xtermRef.current);

    function terminalWrite(data) {
      socket.emit("terminal:write", data);
    }

    xterm.onData((data) => {
      terminalWrite(data);
    });

    socket.on("terminal:data", (data) => {
      xterm.write(data);
    });

    return () => {
      socket.off("terminal:data");
    };
  }, [socket]);

  return (
    <>
      {terminalText}
      <div className="terminal" ref={xtermRef} />
    </>
  );
};

export default Terminal;
