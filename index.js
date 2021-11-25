const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/alice', (req, res) => {
  res.sendFile(__dirname + '/index_alice.html');
});

app.get('/bob', (req, res) => {
  res.sendFile(__dirname + '/index_bob.html');
});

app.get('/carol', (req, res) => {
  res.sendFile(__dirname + '/index_carol.html');
});

let users = {}; // {"alice":null, "bob":null, "carol":null};

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.username = username;
  users[username] = socket.id;
  next();
});

io.on('connection', (socket) => {

    socket.on('message from browser', (param) => {
      console.log("メッセージがきた:"+JSON.stringify(param));
      const to_userid = users[param.to_username];
      const msg = {"from_username":socket.username, content:param.content};
      console.log("このメッセージを"+JSON.stringify(to_userid)+"におくる:"+JSON.stringify(msg));
      io.to(to_userid).emit('message to browser', msg);
    });
  });

server.listen(3000, () => {
  console.log('listening on *:3000');
});