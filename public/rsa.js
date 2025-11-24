// Chat client con intercambio automático de llaves y cifrado P2P
// DOM
const generateBtn = document.getElementById('generate');
const myIdInput = document.getElementById('myId');
const myPubBox = document.getElementById('myPub');
const usersList = document.getElementById('users');
const toSelect = document.getElementById('toSelect');
const nameInput = document.getElementById('nameInput');
const msgInput = document.getElementById('msgInput');
const messages = document.getElementById('messages');
const encryptBtn = document.getElementById('encryptBtn');
const sendBtn = document.getElementById('sendBtn');
const decryptBtn = document.getElementById('decryptBtn');


let myId = null;
let myName = '';


// almacena mapa id -> publicKey
const peers = new Map();


// almacenar pares para mostrar mensajes decodificados localmente
let lastEncryptedReceived = null;


// Generar llaves
generateBtn.addEventListener('click', () => {
const keys = generateKeypair();
myPubBox.value = keys.publicKey;
// registrar en servidor
socket.emit('register_key', keys.publicKey);
alert('Llaves generadas y pública enviada al servidor.');
});


socket.on('connect', () => {
myId = socket.id;
myIdInput.value = myId;
});


// Actualización de claves disponibles
socket.on('keys_update', (arr) => {
// limpiar
usersList.innerHTML = '';
toSelect.innerHTML = '';


arr.forEach(({ id, key }) => {
// mostrar todos excepto yo
const li = document.createElement('li');
li.textContent = id + (id === socket.id ? ' (TU)' : '');
usersList.appendChild(li);


// llenar select
if (id !== socket.id) {
peers.set(id, key);
const opt = document.createElement('option');
opt.value = id;
opt.textContent = id;
toSelect.appendChild(opt);
}
});
});
// Enviar mensaje cifrado al seleccionado
sendBtn.addEventListener('click', () => {
const to = toSelect.value;
if (!to) return alert('Selecciona un destinatario');
if (!msgInput.value.trim()) return;
myName = document.getElementById('nameInput').value.trim() || 'Anon';


// cifrar con la clave pública del destinatario
const pub = peers.get(to);
if (!pub) return alert('No tenemos la clave pública del destinatario');


const encrypted = encryptWithPublicKey(pub, msgInput.value);
if (!encrypted) return alert('Error cifrando (texto muy largo?). Usa mensajes más cortos.');


const payload = {
to,
from: socket.id,
fromName: myName,
ciphertext: encrypted,
ts: Date.now()
};


// enviar al servidor para reenviar únicamente al destinatario
socket.emit('encrypted_message', payload);


// mostrar en pantalla (local) como enviado
const li = document.createElement('li');
li.textContent = `TÚ -> ${to} (cifrado): ${encrypted}`;
messages.appendChild(li);
msgInput.value = '';
});


// Recibir mensaje cifrado
socket.on('encrypted_message', (obj) => {
// mostrar cifrado
const li = document.createElement('li');
li.dataset.from = obj.from;
li.dataset.cipher = obj.ciphertext;
li.textContent = `${obj.fromName || obj.from} (cifrado): ${obj.ciphertext}`;
li.style.cursor = 'pointer';
messages.appendChild(li);


// guardar último para descifrar rápido
lastEncryptedReceived = obj;
});


// Botón descifrar: intenta descifrar el último recibido (si existe)
decryptBtn.addEventListener('click', () => {
if (!lastEncryptedReceived) return alert('No hay mensajes para descifrar.');
const dec = decryptWithPrivateKey(myPrivateKey, lastEncryptedReceived.ciphertext);
if (!dec) return alert('La descifrado falló. Asegúrate de haber generado tus llaves aquí.');


const li = document.createElement('li');
li.textContent = `🔓 ${lastEncryptedReceived.fromName || lastEncryptedReceived.from}: ${dec}`;
messages.appendChild(li);
});


// Nota: myPrivateKey es proporcionado por rsa.js cuando se generan claves.