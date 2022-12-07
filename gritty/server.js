      // server.js

const gritty = require('gritty');
const http = require('http');
const express = require('express');
const io = require('socket.io');

const app = express();
const server = http.createServer(app);
const socket = io.listen(server);

const port = 1337;
const ip = '0.0.0.0';

app.use(gritty());
app.use(express.static(__dirname));

gritty.listen(socket, {
    command: 'mc', // optional
    autoRestart: true, // default
});

server.listen(port, ip);
