import AceEditor from "react-ace";
import { getFileMode } from "../utils/utils";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import { useEffect, useState } from "react";

const Editor = ({ file, code }) => {
  const [editorText, setEditorText] = useState("");

  const handleEditorTextChange = (data) => {
    setEditorText(data);
  };

  useEffect(() => {
    setEditorText(code);
  }, [code]);

  return (
    <>
      <AceEditor
        width="100%"
        height="80vh"
        mode={getFileMode({ file })}
        theme="solarized dark"
        value={editorText}
        onChange={handleEditorTextChange}
        name="editor"
      />
    </>
  );
};

export default Editor;
