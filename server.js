// servidor Node.js + Express + Socket.io
const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// simple relay: recibe mensajes y los reenvía a todos (o a un destinatario)
io.on('connection', socket => {
  console.log('Conectado:', socket.id);

  // mensaje cifrado (clase RSA) -> { fromName, to (optional), ciphertext }
  socket.on('class_rsa_message', (obj) => {
    // Si 'to' existe, enviar solo al destinatario
    if (obj.to) {
      const target = io.sockets.sockets.get(obj.to);
      if (target && target.connected) {
        target.emit('class_rsa_message', obj);
      }
    } else {
      // broadcast a todos
      io.emit('class_rsa_message', obj);
    }
  });

  // enviar lista de clientes conectados (ids)
  socket.on('request_peers', () => {
    const ids = Array.from(io.sockets.sockets.keys());
    socket.emit('peers_list', ids);
  });

  socket.on('disconnect', () => {
    console.log('Desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Servidor en puerto', PORT));
