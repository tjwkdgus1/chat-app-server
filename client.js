// 서버 URL
const SERVER_URL = "https://chat-app-server-a447.onrender.com";

// Socket.io 연결
const socket = io(SERVER_URL, { transports: ["websocket", "polling"] });

// 채팅 요소
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const nameInput = document.getElementById("name-input");

// 이미지 업로드 요소
const photoInput = document.getElementById("photo-input");
const uploadBtn = document.getElementById("upload-btn");
const imageGallery = document.getElementById("image-gallery");
const imageCount = document.getElementById("image-count");

// 사용자 이름 저장 변수
let userName = "";
let totalImages = 0;
let selectedFiles = [];

// ---------------------
// Socket 이벤트 처리
// ---------------------

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

// 기존 이미지 목록 불러오기
socket.on("image history", (images) => {
  imageGallery.innerHTML = "";
  totalImages = 0;
  images.forEach(addImage);
});

// 새로운 이미지 수신
socket.on("new images", (images) => {
  images.forEach(addImage);
});

// ---------------------
// 채팅 전송
// ---------------------
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

// ---------------------
// 이미지 업로드
// ---------------------
photoInput.addEventListener("change", (e) => {
  selectedFiles = Array.from(e.target.files);
  uploadBtn.disabled = selectedFiles.length === 0;

  if (selectedFiles.length > 0) {
    uploadBtn.textContent = `Add ${selectedFiles.length} photo${selectedFiles.length > 1 ? 's' : ''} to Gallery`;
  } else {
    uploadBtn.textContent = "Add to Gallery";
  }
});

uploadBtn.addEventListener("click", async () => {
  if (selectedFiles.length === 0) return;

  const formData = new FormData();
  selectedFiles.forEach(file => formData.append("photos", file));

  try {
    const res = await fetch(`${SERVER_URL}/upload`, {
      method: "POST",
      body: formData
    });
    const uploadedImages = await res.json(); // [{ url, name, size, type, time }]

    // 서버로 새 이미지 이벤트 전송
    socket.emit("new images", uploadedImages);

    // 선택 초기화
    photoInput.value = "";
    selectedFiles = [];
    uploadBtn.disabled = true;
    uploadBtn.textContent = "Add to Gallery";
  } catch (err) {
    console.error("Upload failed:", err);
  }
});

// 이미지 추가 함수
function addImage(img) {
  const imageDiv = document.createElement("div");
  imageDiv.className = "bg-slate-700 rounded-lg overflow-hidden hover:bg-slate-600 transition-colors";

  imageDiv.innerHTML = `
    <div class="aspect-square bg-slate-600 flex items-center justify-center">
      <img src="${img.url}" alt="${img.name}" class="w-full h-full object-cover">
    </div>
    <div class="p-4">
      <h4 class="font-medium text-white mb-2">${img.name}</h4>
      <p class="text-sm text-slate-400 mb-3">Uploaded ${img.time}</p>
      <div class="flex items-center justify-between">
        <span class="text-xs text-slate-500">${img.type.split('/')[1].toUpperCase()} • ${(img.size / 1024).toFixed(1)}KB</span>
        <button onclick="downloadUploadedImage('${img.url}', '${img.name}')" class="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1">
          <i data-lucide="download" class="w-4 h-4"></i>
          Download
        </button>
      </div>
    </div>
  `;
  imageGallery.insertBefore(imageDiv, imageGallery.firstChild);
  totalImages++;
  updateImageCount();
  lucide.createIcons();
}

function updateImageCount() {
  imageCount.textContent = `${totalImages} image${totalImages > 1 ? 's' : ''} total`;
}

function downloadUploadedImage(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
