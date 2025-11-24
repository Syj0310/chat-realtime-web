c// Conectar al servidor WebSocket
const socket = new WebSocket("ws://localhost:3000");

// DOM
const messages = document.getElementById("messages");
const input = document.getElementById("messageInput");

const encryptBtn = document.getElementById("encryptBtn");
const decryptBtn = document.getElementById("decryptBtn");
const sendBtn = document.getElementById("sendBtn");

// Generar par RSA
const crypt = new JSEncrypt({ default_key_size: 1024 });
crypt.getKey();

const publicKey = crypt.getPublicKey();
const privateKey = crypt.getPrivateKey();

document.getElementById("publicKey").value = publicKey;
document.getElementById("privateKey").value = privateKey;

// Último mensaje recibido
let lastEncryptedMessage = "";

socket.onmessage = (event) => {
    const div = document.createElement("div");
    div.className = "message";
    div.textContent = "📩 Cifrado: " + event.data;
    messages.appendChild(div);

    lastEncryptedMessage = event.data;
};

// Botón cifrar
encryptBtn.onclick = () => {
    const encrypted = crypt.encrypt(input.value);

    if (!encrypted) {
        alert("No se pudo cifrar.");
        return;
    }

    input.value = encrypted;
};

// Enviar mensaje ya cifrado
sendBtn.onclick = () => {
    if (input.value.trim() === "") return;

    socket.send(input.value);

    const div = document.createElement("div");
    div.className = "message";
    div.textContent = "📤 Enviado (cifrado): " + input.value;
    messages.appendChild(div);

    input.value = "";
};

// Descifrar último mensaje recibido
decryptBtn.onclick = () => {
    if (!lastEncryptedMessage) {
        alert("No hay mensajes cifrados.");
        return;
    }

    const decrypted = crypt.decrypt(lastEncryptedMessage);

    const div = document.createElement("div");
    div.className = "message";
    div.textContent = "🔓 Descifrado: " + decrypted;
    messages.appendChild(div);
};
