const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
// Allow CORS so clients hosted on GitHub Pages (or other domains) can connect
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET","POST"] }
});

// simple in-memory history (keeps only recent messages)
let messages = [];

io.on("connection", (socket) => {
  console.log("✅ connected:", socket.id);

  // send chat history to newly connected client
  socket.emit("chat history", messages);

  // receive message from client
  socket.on("chat message", (msg) => {
    // 클라이언트로부터 객체 형태의 메시지를 받음
    const { name, text } = msg;
    const sanitizedText = String(text).slice(0, 1000); // simple sanitization/limit
    // 이름과 텍스트를 포함하는 객체를 저장
    const messageObject = { name, text: sanitizedText };
    messages.push(messageObject);
    if (messages.length > 500) messages.shift();
    // 모든 클라이언트에게 객체 형태로 메시지 전송
    io.emit("chat message", messageObject);
  });

  socket.on("disconnect", () => {
    console.log("⛔ disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
