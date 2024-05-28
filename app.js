const express = require('express');
const socket = require('socket.io');
const http = require('http');
const { Chess } = require('chess.js');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socket(server);
//socket needs http server that will be based on express
//socket helps us in real time conversation

const chess = new Chess();
let players = {};
let currentPlayer = 'w';

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index', { title: 'Chess Game' });
});

io.on('connection', (uniquesocket) => {
  console.log('new user connected');
});
// whenever someone is connected,socket is that unique user that is connected
//we have to set up socket.io at frontend also so that socketio at frontend is connected with socketio at backend
if (!players.white) {
  //if there is no white player then the player who is connected is white player and we are sending him response from backend to his browser(frontend)
  players.white = uniquesocket.id;
  uniquesocket.emit('playerRole', 'w');
} else if (!players.black) {
  players.black = uniquesocket.id;
  uniquesocket.emit('playerRole', 'b');
} else {
  uniquesocket.emit('spectatorRole');
  // if people join in full room
}
socket.on('disconnect', () => {
  if (uniquesocket.id === players.white) {
    delete players.white;
  } else if (uniquesocket.id === players.black) {
    delete players.black;
  }
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
