const socket = io("https://chat-app-server-a447.onrender.com"); // 배포 후 URL 변경

const chatBox = document.getElementById("chat-box");
const nicknameInput = document.getElementById("nickname");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");

function sendMessage() {
  const nickname = nicknameInput.value.trim();
  const message = messageInput.value.trim();

  if (!nickname || !message) return;
  socket.emit("chatMessage", { nickname, message });
  messageInput.value = "";
}

sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });

socket.on("chatMessage", (data) => {
  const msg = document.createElement("div");
  msg.classList.add("chat-message");
  msg.classList.add(data.nickname === nicknameInput.value.trim() ? "self" : "other");
  msg.textContent = `${data.nickname}: ${data.message}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
});
