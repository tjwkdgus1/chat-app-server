const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.static(__dirname));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // 업로드 폴더 공개

// multer 설정 (파일 업로드)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}-${file.originalname}`);
  },
});
const upload = multer({ storage });

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// in-memory chat history
let messages = [];
// persistent image list
let images = [];

// 업로드 API
app.post("/upload", upload.array("photos"), (req, res) => {
  const uploadedFiles = req.files.map((file) => ({
    url: `/uploads/${file.filename}`,
    name: file.originalname,
    size: file.size,
    type: file.mimetype,
    time: new Date().toISOString(),
  }));

  // 서버 메모리에 저장
  images.push(...uploadedFiles);

  // 모든 클라이언트에 방송
  io.emit("new images", uploadedFiles);

  res.json({ success: true, files: uploadedFiles });
});

io.on("connection", (socket) => {
  console.log("✅ connected:", socket.id);

  // 채팅 히스토리 전송
  socket.emit("chat history", messages);

  // 이미지 목록 전송 (새로 접속한 클라이언트용)
  socket.emit("image history", images);

  // 채팅 메시지 수신
  socket.on("chat message", (msg) => {
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
