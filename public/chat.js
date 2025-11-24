// Client chat con RSA "de la clase" (p=7,q=11,e=13,d=37)
// mapping: a=1 ... z=26, space=0
const socket = io();

// Parámetros fijos de la clase
const p = 7;
const q = 11;
const n = p * q;        // 77
const phi = (p - 1) * (q - 1); // 60
const e = 13;
const d = 37; // inverso modular de e mod phi (13*37 % 60 == 1)

const nameInput = document.getElementById('nameInput');
const myId = document.getElementById('myId');
const peersList = document.getElementById('peersList');
const refreshPeers = document.getElementById('refreshPeers');
const toSelect = document.getElementById('toSelect');

const messages = document.getElementById('messages');
const msgInput = document.getElementById('msgInput');
const encryptBtn = document.getElementById('encryptBtn');
const sendBtn = document.getElementById('sendBtn');
const decryptBtn = document.getElementById('decryptBtn');

let lastReceivedCipher = null;

// util: powmod con BigInt
function powmod(base, exp, mod) {
  base = BigInt(base);
  exp = BigInt(exp);
  mod = BigInt(mod);
  let result = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % mod;
    base = (base * base) % mod;
    exp >>= 1n;
  }
  return result;
}

// mapeo letra -> número y viceversa
function charToNum(ch) {
  if (ch === ' ') return 0;
  const c = ch.toLowerCase();
  if (c >= 'a' && c <= 'z') {
    return c.charCodeAt(0) - 96; // a->1
  }
  // otros caracteres: retornamos -1 (no cifrable); los dejaremos como -1
  return -1;
}
function numToChar(n) {
  if (n === 0) return ' ';
  if (n >= 1 && n <= 26) {
    return String.fromCharCode(96 + n);
  }
  return '?';
}

// cifrar texto: devuelve cadena de números cifrados separados por '-'
// para caracteres no cifrables se envía 'X<ascii>' (ej: 'X33' para '!')
function classRsaEncrypt(text) {
  const parts = [];
  for (const ch of text) {
    const m = charToNum(ch);
    if (m === -1) {
      // marcar como no-cifrable: lo dejamos en claro con prefijo X + código
      parts.push('X' + ch.charCodeAt(0));
    } else {
      // calcular c = m^e mod n
      const c = powmod(m, e, n);
      parts.push(c.toString());
    }
  }
  return parts.join('-');
}

// descifrar: input es la cadena con '-' separador
function classRsaDecrypt(ciphertext) {
  const parts = ciphertext.split('-');
  let out = '';
  for (const p of parts) {
    if (p.startsWith('X')) {
      // caracter no cifrado
      const code = parseInt(p.slice(1), 10);
      out += String.fromCharCode(code);
    } else {
      const c = BigInt(p);
      const m = powmod(c, d, n); // m = c^d mod n
      const mi = Number(m); // pequeño
      out += numToChar(mi);
    }
  }
  return out;
}

// UI: refrescar lista de peers (ids)
refreshPeers.addEventListener('click', () => {
  socket.emit('request_peers');
});
socket.on('peers_list', (ids) => {
  peersList.innerHTML = '';
  toSelect.innerHTML = '<option value="">(A todos)</option>';
  ids.forEach(id => {
    const li = document.createElement('li');
    li.textContent = id;
    peersList.appendChild(li);
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = id + (id === socket.id ? ' (TU)' : '');
    toSelect.appendChild(opt);
  });
});

// cuando nos conectamos actualizamos nuestro ID
socket.on('connect', () => {
  myId.value = socket.id;
  // pedir peers automáticamente
  socket.emit('request_peers');
});

// botón cifrar: pone el ciphertext en el input
encryptBtn.addEventListener('click', () => {
  const text = msgInput.value;
  if (!text) return alert('Escribe algo para cifrar.');
  const cipher = classRsaEncrypt(text);
  msgInput.value = cipher;
});

// enviar cifrado (el contenido del input ya debe ser ciphertext)
sendBtn.addEventListener('click', () => {
  const to = toSelect.value || null;
  const fromName = nameInput.value.trim() || 'Anon';
  const ciphertext = msgInput.value.trim();
  if (!ciphertext) return alert('No hay mensaje para enviar.');
  // enviar objeto con destinatario opcional
  const payload = { to, from: socket.id, fromName, ciphertext, ts: Date.now() };
  socket.emit('class_rsa_message', payload);

  // mostrar localmente como enviado
  const li = document.createElement('li');
  li.textContent = `TÚ -> ${to || 'TODOS'} (cifrado): ${ciphertext}`;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
  msgInput.value = '';
});

// recibir mensaje cifrado
socket.on('class_rsa_message', (obj) => {
  const li = document.createElement('li');
  li.textContent = `${obj.fromName || obj.from} (cifrado): ${obj.ciphertext}`;
  li.dataset.cipher = obj.ciphertext;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
  lastReceivedCipher = obj.ciphertext;
});

// descifrar último recibido
decryptBtn.addEventListener('click', () => {
  if (!lastReceivedCipher) return alert('No hay mensajes recibidos para descifrar.');
  const plain = classRsaDecrypt(lastReceivedCipher);
  const li = document.createElement('li');
  li.textContent = `🔓 Descifrado: ${plain}`;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});
