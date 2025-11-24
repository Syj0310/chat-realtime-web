
// servidor Node.js + Express + Socket.io
const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');


const app = express();
const server = http.createServer(app);
const io = new Server(server);


app.use(express.static(path.join(__dirname, 'public')));


// Mapa socket.id -> publicKey
const publicKeys = new Map();


io.on('connection', (socket) => {
console.log('Usuario conectado:', socket.id);


// Cuando el cliente envía su clave pública
socket.on('register_key', (pubKey) => {
publicKeys.set(socket.id, pubKey);
// enviar mapa reducido (id -> publicKey) a todos para que puedan encontrar destinatarios
const mapObj = Array.from(publicKeys.entries()).map(([id, key]) => ({ id, key }));
io.emit('keys_update', mapObj);
});


// Mensaje cifrado: { to: socketIdDestino, fromName, payload }
socket.on('encrypted_message', (obj) => {
const { to } = obj;
// reenviar solo al destinatario si existe
const target = io.sockets.sockets.get(to);
if (target && target.connected) {
target.emit('encrypted_message', obj);
}
});


socket.on('disconnect', () => {
publicKeys.delete(socket.id);
const mapObj = Array.from(publicKeys.entries()).map(([id, key]) => ({ id, key }));
io.emit('keys_update', mapObj);
console.log('Usuario desconectado:', socket.id);
});
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Servidor en puerto', PORT));
