const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, "public")));

let messages = []; // ✅ 메모리에 메시지 저장

io.on("connection", (socket) => {
  console.log("User connected");

  // ✅ 접속한 사용자에게 기존 메시지 전송
  socket.emit("chat history", messages);

  // ✅ 새 메시지 저장 및 방송
  socket.on("chat message", (msg) => {
    messages.push(msg);

    // 메시지가 너무 많아지면 최근 50개만 유지
    if (messages.length > 50) messages.shift();

    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
