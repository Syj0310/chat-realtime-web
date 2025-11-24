const socket = io();
const input = document.getElementById("input");
const messages = document.getElementById("messages");


const encryptBtn = document.getElementById("encryptBtn");
const decryptBtn = document.getElementById("decryptBtn");
const sendBtn = document.getElementById("sendBtn");


let lastEncrypted = "";


// Cifrar mensaje
encryptBtn.onclick = () => {
const text = input.value.trim();
if (!text) return alert("Escribe algo para cifrar.");


const encrypted = encryptMessage(text);
if (!encrypted) return alert("No se pudo cifrar. Asegúrate de tener la llave pública de tu amigo.");


lastEncrypted = encrypted;
input.value = encrypted;
};


// Descifrar mensaje
decryptBtn.onclick = () => {
const text = input.value.trim();
if (!text) return;


const decrypted = decryptMessage(text);
input.value = decrypted || "(No se pudo descifrar)";
};


// Enviar a tu amigo
sendBtn.onclick = () => {
if (!input.value.trim()) return;


socket.emit("chat message", input.value.trim());
input.value = "";
};


// Recibir mensajes del servidor
socket.on("chat message", (msg) => {
const li = document.createElement("li");
li.textContent = msg;
messages.appendChild(li);
messages.scrollTop = messages.scrollHeight;
});
