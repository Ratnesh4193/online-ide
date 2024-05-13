import "@xterm/xterm/css/xterm.css";
import { Terminal as XTermimal } from "@xterm/xterm";
import { useEffect, useRef, useState } from "react";

const Terminal = ({ socket }) => {
  const xtermRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const xterm = new XTermimal({ rows: 20 });
    xterm.open(xtermRef.current);

    xterm.onData((data) => {
      socket.emit("terminal:write", data);
    });

    socket.on("terminal:data", (data) => {
      xterm.write(data);
    });

    xterm.write("ls \r");
    return () => {
      socket.off("terminal:data");
    };
  }, [socket]);

  return (
    <>
      <div ref={xtermRef} />
    </>
  );
};

export default Terminal;
