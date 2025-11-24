const socket = io();

const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const usernameInput = document.getElementById('username');
const btnJoin = document.getElementById('btnJoin');
const usersList = document.getElementById('usersList');
const typingDiv = document.getElementById('typing');

let joined = false;
let typing = false;
let timeout;

btnJoin.onclick = () => {
  if (!usernameInput.value.trim()) return;
  socket.emit('join', usernameInput.value.trim());
  joined = true;
};

input.addEventListener('input', () => {
  if (!typing) {
    typing = true;
    socket.emit('typing', true);
  }
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    typing = false;
    socket.emit('typing', false);
  }, 1500);
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value.trim()) {
    socket.emit('chat_message', input.value);
    input.value = '';
  }
});

socket.on('chat_message', (msg) => {
  const item = document.createElement('div');
  item.textContent = `${msg.user}: ${msg.text}`;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});

socket.on('system_message', (txt) => {
  const item = document.createElement('div');
  item.style.opacity = 0.7;
  item.textContent = txt;
  messages.appendChild(item);
});

socket.on('users', (users) => {
  usersList.innerHTML = "";
  users.forEach(u => {
    const li = document.createElement('li');
    li.textContent = u;
    usersList.appendChild(li);
  });
});

socket.on('typing', ({ user, typing }) => {
  typingDiv.textContent = typing ? `${user} está escribiendo...` : "";
});
