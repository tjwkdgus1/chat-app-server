// IMPORTANT: set SERVER_URL to your Render server URL (include https://)
// If you're hosting the client on the same origin as the server, you can use `io()` with no args.
const SERVER_URL = "https://chat-app-server-a447.onrender.com"; // <<<<-- REPLACE THIS with your Render URL

// If client is hosted on a different origin (GitHub Pages), specify the server URL
const socket = SERVER_URL === "https://YOUR_RENDER_URL_HERE" ?
  io() : io(SERVER_URL, { transports: ['websocket', 'polling'] });

const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");

// 이름 입력 관련 요소 가져오기
const nameInput = document.getElementById("name-input");
let userName = ''; // 사용자 이름을 저장할 변수

socket.addEventListener("connect", () => {
  console.log("socket connected:", socket.id);
});

socket.addEventListener("connect_error", (err) => {
  console.error("connect_error:", err);
});

// receive history
socket.on("chat history", (history) => {
  history.forEach(addMessage);
});

// receive new message
socket.on("chat message", (msg) => {
  addMessage(msg);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const nameValue = nameInput.value.trim();
  const messageValue = input.value.trim();

  if (!nameValue) { // 이름이 비어있으면 알림
    alert("이름을 입력해주세요.");
    nameInput.focus();
    return;
  }

  if (!messageValue) { // 메시지가 비어있으면 아무것도 하지 않음
    return;
  }

  userName = nameValue; // 현재 입력된 이름을 userName에 저장
  // 메시지와 이름을 객체 형태로 함께 전송
  socket.emit("chat message", { name: userName, text: messageValue });

  // 입력 필드 초기화
  input.value = "";
  // 이름 필드는 유지 (또는 필요에 따라 초기화)
  // nameInput.value = "";
});

function addMessage(msg) {
  const li = document.createElement("li");
  // 이름과 메시지를 함께 표시
  li.textContent = `${msg.name}: ${msg.text}`;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
}
