const http = require("http");
const express = require("express");
const { Server: SocketServer } = require("socket.io");
const cors = require("cors");
const pty = require("node-pty");
const os = require("os");
const fs = require("fs").promises;
const path = require("path");
const chokidar = require("chokidar");

const app = express();
const server = http.createServer(app);
const io = new SocketServer({
  cors: "*",
});
app.use(cors());
io.attach(server);

chokidar.watch("./user").on("all", (event, path) => {
  console.log("file:refresh", path);
  io.emit("file:refresh", path);
});

const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

const ptyProcess = pty.spawn("bash", [], {
  name: "xterm-color",
  cols: 80,
  rows: 30,
  cwd: process.env.INIT_CWD + "/user",
  env: process.env,
});

ptyProcess.onData((data) => {
  io.emit("terminal:data", data);
});

io.on("connection", (socket) => {
  console.log("a user connected: ", socket.id);

  socket.on("disconnect", () => {
    console.log("user disconnected: ", socket.id);
  });

  socket.emit("file:refresh");

  socket.on("file:change", async ({ path, content }) => {
    console.log("file:change ", path, content);
    await fs.writeFile(`./user${path}`, content);
  });

  socket.on("terminal:write", (data) => {
    console.log("terminal:write ", data);
    ptyProcess.write(data);
  });
});

app.get("/files", async (req, res) => {
  const fileTree = await generateFileTree("./user");
  return res.json({ tree: fileTree });
});

app.get("/files/content", async (req, res) => {
  const path = req.query.path;
  console.log("path:", path);
  const content = await fs.readFile(`./user${path}`, "utf-8");
  return res.json({ content });
});

async function generateFileTree(directory) {
  console.log("generateFileTree: ", directory);
  const tree = {};

  async function buildTree(currentDir, currentTree) {
    const files = await fs.readdir(currentDir);
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        currentTree[file] = {};
        currentTree.isOpened = false;
        await buildTree(filePath, currentTree[file]);
      } else {
        currentTree[file] = null;
      }
    }
  }

  await buildTree(directory, tree);

  console.log("tree: ", tree);
  return tree;
}

server.listen(9001, () => console.log(`🐳 Docker server running on port 9001`));
