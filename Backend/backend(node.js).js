const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

// Database setup, if using a database
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/tic-tac-toe', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Model for storing game state
const Game = mongoose.model('Game', {
  player1: String,
  player2: String,
  board: [Number],
  turn: Number
});

// API routes
app.get('/games', (req, res) => {
  // Return a list of available games
  Game.find({ player2: null }, (err, games) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(games);
    }
  });
});

app.post('/games', (req, res) => {
  // Create a new game
  const game = new Game({
    player1: req.body.username,
    board: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    turn: 1
  });
  game.save((err) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(game);
    }
  });
});

app.put('/games/:id', (req, res) => {
  // Make a move in an existing game
  Game.findById(req.params.id, (err, game) => {
    if (err) {
      res.status(500).send(err);
    } else {
      // Update the game state with the new move
      game.board[req.body.index] = req.body.player;
      game.turn = (game.turn === 1) ? 2 : 1;
      game.save((err) => {
        if (err) {
          res.status(500).send(err);
        } else {
          // Emit an event to all connected sockets to update the game state
          io.emit('update', game);
          res.send(game);
        }
      });
    }
  });
});

// Websocket setup
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('Tic Tac Toe API listening on port 3000');
});
