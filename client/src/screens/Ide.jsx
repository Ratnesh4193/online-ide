import { useCallback, useEffect, useState } from "react";
import "../App.css";
import Editor from "../components/Editor";
import Terminal from "../components/Terminal";
import useSocket from "../hooks/useSocket";
import FileTree from "../components/FileTree/FileTree";

const serverURL = "http://localhost:9001";
const Ide = () => {
  const socket = useSocket(serverURL);

  const [fileTree, setFileTree] = useState({});
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedFileContent, setSelectedFileContent] = useState("");

  const getFileTree = async (changedFile) => {
    const response = await fetch(`${serverURL}/files`);
    const result = await response.json();
    setFileTree(result.tree);
    if (changedFile === selectedFile) {
      getFileContents();
    }
  };

  const getFileContents = async () => {
    if (!selectedFile) return;
    const response = await fetch(
      `${serverURL}/files/content?path=${selectedFile}`
    );
    const result = await response.json();
    setSelectedFileContent(result.content);
  };

  useEffect(() => {
    if (selectedFile) getFileContents();
  }, [getFileContents, selectedFile]);

  useEffect(() => {
    if (!socket) return;
    socket.on("file:refresh", getFileTree);
    return () => {
      socket.off("file:refresh", getFileTree);
    };
  }, [socket]);

  return (
    <div className="ide__container">
      <div className="ide__sidepanel">
        <FileTree
          onSelect={(path) => {
            setSelectedFile(path);
          }}
          tree={fileTree}
        />
      </div>
      <div className="ide__mainpanel">
        <div className="ide__editor">
          {selectedFile && <p>{selectedFile.replaceAll("/", " > ")} </p>}
          <div>
            {socket && (
              <Editor
                socket={socket}
                file={selectedFile}
                code={selectedFileContent}
              />
            )}
          </div>
        </div>
        <div className="ide__terminal">
          {socket && <Terminal socket={socket} />}
        </div>
      </div>
    </div>
  );
};

export default Ide;
