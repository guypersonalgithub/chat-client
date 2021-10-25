import io from 'socket.io-client';
require("dotenv").config();

const socket = io(process.env.URL);

export default socket;