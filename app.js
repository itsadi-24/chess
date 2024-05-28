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
  uniquesocket.on('disconnect', () => {
    if (uniquesocket.id === players.white) {
      delete players.white;
    } else if (uniquesocket.id === players.black) {
      delete players.black;
    }
  });

  uniquesocket.on('move', (move) => {
    //this move will come from frontend
    try {
      //it means if the turn belongs to a player and other player tries to play it we will return instantly that is not valid move
      if (chess.turn() === 'w' && uniquesocket.id !== players.white) return;
      if (chess.turn() === 'b' && uniquesocket.id !== players.black) return;

      const result = chess.move(move);
      if (result) {
        //if the move is valid then we will emit move event to all the players
        currentPlayer = chess.turn(move);
        io.emit('move', move);
        io.emit('boardState', chess.fen());
        if (chess.in_checkmate()) {
          io.emit('message', 'Checkmate!');
          io.emit('gameover');
        } else if (chess.in_check()) {
          io.emit('message', 'Check!');
        }
      } else {
        console.log('Inavlid move :', move);
        uniquesocket.emit('Invalid move', move);
      }
    } catch (err) {
      console.log('Error:', err);
      uniquesocket.emit('Invalid move', move);
    }
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
