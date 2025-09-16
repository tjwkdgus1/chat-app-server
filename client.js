// 서버 URL
const SERVER_URL = "https://chat-app-server-a447.onrender.com";

// Socket.io 연결
const socket = io(SERVER_URL, { transports: ["websocket", "polling"] });

const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const nameInput = document.getElementById("name-input");

// 사용자 이름 저장 변수
let userName = "";

// 연결 성공
socket.on("connect", () => {
  console.log("✅ socket connected:", socket.id);
});

// 연결 실패
socket.on("connect_error", (err) => {
  console.error("❌ connect_error:", err);
});

// 기존 채팅 기록 불러오기
socket.on("chat history", (history) => {
  messages.innerHTML = "";
  history.forEach(addMessage);
});

// 새로운 메시지 수신
socket.on("chat message", (msg) => addMessage(msg));

// 메시지 전송
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const nameValue = nameInput.value.trim();
  const messageValue = input.value.trim();

  if (!nameValue) {
    alert("이름을 입력해주세요.");
    nameInput.focus();
    return;
  }
  if (!messageValue) return;

  userName = nameValue;

  // 서버에 메시지 전송
  socket.emit("chat message", { name: userName, message: messageValue });

  input.value = "";
});

// 메시지 추가 함수
function addMessage(msg) {
  const li = document.createElement("li");
  li.innerHTML = `<span class="text-cyan-400 font-medium">${msg.name}:</span> <span class="text-white">${msg.message}</span>`;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
}
