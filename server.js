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
    const text = String(msg).slice(0, 1000); // simple sanitization/limit
    messages.push(text);
    if (messages.length > 500) messages.shift();
    io.emit("chat message", text);
  });

  socket.on("disconnect", () => {
    console.log("⛔ disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
