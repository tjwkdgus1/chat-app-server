const socket = io("https://chat-app-server.onrender.com");
const messagesList = document.getElementById("messages");
const form = document.getElementById("form");
const input = document.getElementById("input");

// ✅ 기존 채팅 기록 불러오기
socket.on("chat history", (history) => {
  history.forEach((msg) => {
    const item = document.createElement("li");
    item.textContent = msg;
    messagesList.appendChild(item);
  });
});

// 새 메시지 수신
socket.on("chat message", (msg) => {
  const item = document.createElement("li");
  item.textContent = msg;
  messagesList.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

// 메시지 전송
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit("chat message", input.value);
    input.value = "";
  }
});
