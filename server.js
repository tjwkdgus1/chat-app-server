const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("사용자 접속:", socket.id);

  socket.on("chatMessage", (data) => {
    io.emit("chatMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("사용자 종료:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`서버 실행 중: http://localhost:${PORT}`));
