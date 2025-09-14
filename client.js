const SERVER_URL = "https://chat-app-server-a447.onrender.com";
const socket = io(SERVER_URL);

function sendMessage() {
  const username = document.getElementById("username").value || "익명";
  const message = document.getElementById("message").value;

  if (message.trim() !== "") {
    socket.emit("chat message", { user: username, text: message });
    document.getElementById("message").value = "";
  }
}

socket.on("chat message", (msg) => {
  const li = document.createElement("li");
  li.textContent = `${msg.user}: ${msg.text}`;
  document.getElementById("messages").appendChild(li);
});
