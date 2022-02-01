const feathers = require('@feathersjs/feathers');
const socketio = require('@feathersjs/socketio-client');
const auth = require('@feathersjs/authentication-client');
const io = require('socket.io-client');

const socket = io(process.env.API_URL);
const app = feathers();

socket.on('disconnect', (reason) => console.log('disconnect', reason));

console.log('🔌 Connecting to: ', process.env.API_URL);

// Set up Socket.io client with the socket
app.configure(socketio(socket, { timeout: 30*1000 }));
app.configure(auth());

app.auth = async () => {
  const payload = {
    strategy: 'label-printer',
    _id: process.env.PRINTER_ID,
    password: process.env.PRINTER_SECRET,
  };
  try {
    await app.authenticate(payload);
  } catch (err) {
    try {
      await app.authenticate(payload);
    } catch (err) {
      try {
        await app.authenticate(payload);
      } catch (err) {
        await app.authenticate(payload);
      }
    }
  }
};

module.exports = app;