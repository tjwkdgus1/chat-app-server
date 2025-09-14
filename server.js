const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET","POST"] }
});

// in-memory message history
let messages = [];

io.on("connection", (socket) => {
  console.log("✅ connected:", socket.id);

  // send chat history
  socket.emit("chat history", messages);

  // receive message from client
  socket.on("chat message", (msg) => {
    // msg 구조: { name: "사용자명", message: "메시지 내용" }
    const name = String(msg.name).slice(0, 50);
    const text = String(msg.message).slice(0, 1000);

    const messageObject = { name, message: text };

    messages.push(messageObject);
    if (messages.length > 500) messages.shift();

    io.emit("chat message", messageObject);
  });

  socket.on("disconnect", () => {
    console.log("⛔ disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
