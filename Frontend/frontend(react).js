import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

function TicTacToe() {
  // State for the game object and the current player
  const [game, setGame] = useState(null);
  const [player, setPlayer] = useState(null);

  // Connect to the backend API using websockets
  useEffect(() => {
    const socket = io('http://localhost:3000');
    socket.on('connect', () => {
      console.log('Connected to the server');
    });
    socket.on('update', (data) => {
      setGame(data);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  // Function to handle a player joining a game
  const joinGame = (gameId) => {
    // Send a websocket event to the backend to join the game
    socket.emit('join', gameId, (response) => {
      setGame(response.game);
      setPlayer(response.player);
    });
  };

  // Function to handle a player making a move
  const makeMove = (index) => {
    // Send a websocket event to the backend to make the move
    socket.emit('move', { gameId: game._id, index, player }, (response) => {
      setGame(response.game);
    });
  };

  // Render the game UI
  return (
    <div>
      {game ? (
        <div>
          {/* Display the game board */}
          <div className="board">
            {game.board.map((cell, index) => (
              <div
                key={index}
                className="cell"
                onClick={() => makeMove(index)}
              >
                {cell === 1 ? 'X' : cell === 2 ? 'O' : ''}
              </div>
            ))}
          </div>
          {/* Display the current player and game status */}
          <div className="status">
            {game.winner ? (
              `Player ${game.winner} won!`
            ) : (
              `Turn: Player ${game.turn}`
            )}
          </div>
        </div>
      ) : (
        <div>
          {/* Display a list of available games to join */}
          <h1>Tic Tac Toe</h1>
          <h2>Available Games:</h2>
          <ul>
            {games.map((game) => (
              <li key={game._id} onClick={() => joinGame(game._id)}>
                Game {game._id}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default TicTacToe;
