const feathers = require('@feathersjs/feathers');
const socketio = require('@feathersjs/socketio-client');
const auth = require('@feathersjs/authentication-client');
const io = require('socket.io-client');
const axios = require('axios');

const socket = io(process.env.API_URL, { transports: ['websocket'], timeout: 30*1000 });
const app = feathers();

socket.on('connect', () => console.log('connected'));
socket.on('disconnect', (reason) => console.log('disconnect', reason));
socket.on('connect_error', (error) => console.log('connect_error', error.message));

console.log('🔌 Connecting to: ', process.env.API_URL);

// Set up Socket.io client with the socket
app.configure(socketio(socket, { timeout: 30*1000 }));
app.configure(auth());

app.auth = async () => {
  const { version, gitHash } = (await axios.get(`${process.env.API_URL}/version`)).data;
  const payload = {
    strategy: 'label-printer',
    _id: process.env.PRINTER_ID,
    password: process.env.PRINTER_SECRET,
  };
  console.log(`🔑 Authenticating with: ${payload._id} (v${version} - ${gitHash})`);
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

app.isConnected = () => socket.connected;

module.exports = app;