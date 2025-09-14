// IMPORTANT: set SERVER_URL to your Render server URL (include https://)
// If you're hosting the client on the same origin as the server, you can use `io()` with no args.
const SERVER_URL = "https://chat-app-server-a447.onrender.com"; // <<<<-- REPLACE THIS with your Render URL

// If client is hosted on a different origin (GitHub Pages), specify the server URL
const socket = SERVER_URL === "https://YOUR_RENDER_URL_HERE" ? 
  io() : io(SERVER_URL, { transports: ['websocket', 'polling'] });

const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");

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
  const val = input.value.trim();
  if (!val) return;
  socket.emit("chat message", val);
  input.value = "";
});

function addMessage(msg) {
  const li = document.createElement("li");
  li.textContent = msg;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
}
