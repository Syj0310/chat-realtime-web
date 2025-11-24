const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

const users = {};

io.on('connection', (socket) => {
  socket.on('join', (username) => {
    users[socket.id] = username || 'Anonimo';
    socket.broadcast.emit('system_message', `${users[socket.id]} se ha unido al chat.`);
    io.emit('users', Object.values(users));
  });

  socket.on('chat_message', (msg) => {
    const username = users[socket.id] || 'Anonimo';
    io.emit('chat_message', { user: username, text: msg, time: new Date().toISOString() });
  });

  socket.on('typing', (isTyping) => {
    const username = users[socket.id] || 'Anonimo';
    socket.broadcast.emit('typing', { user: username, typing: isTyping });
  });

  socket.on('disconnect', () => {
    const username = users[socket.id];
    if (username) {
      socket.broadcast.emit('system_message', `${username} ha salido del chat.`);
      delete users[socket.id];
      io.emit('users', Object.values(users));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
