// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server);

// app.use(express.static('public'));

// let players = {};
// let currentTurn = "X";
// let board = Array(3).fill(null).map(() => Array(3).fill(""));

// io.on('connection', socket => {
//   console.log('A user connected:', socket.id);

//   // Assign player
//   if (!players.X) {
//     players.X = socket.id;
//     socket.emit('assignPlayer', 'X');
//   } else if (!players.O) {
//     players.O = socket.id;
//     socket.emit('assignPlayer', 'O');
//   } else {
//     socket.emit('spectator');
//   }

//   // Handle move
//   socket.on('makeMove', ({ row, col, symbol }) => {
//     if (board[row][col] === "" && symbol === currentTurn) {
//       board[row][col] = symbol;
//       currentTurn = currentTurn === "X" ? "O" : "X";
//       io.emit('updateBoard', { row, col, symbol, nextTurn: currentTurn });
//     }
//   });

//   socket.on('resetGame', () => {
//     board = Array(3).fill(null).map(() => Array(3).fill(""));
//     currentTurn = "X";
//     io.emit('resetGame');
//   });

//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);
//     if (players.X === socket.id) delete players.X;
//     if (players.O === socket.id) delete players.O;
//     board = Array(3).fill(null).map(() => Array(3).fill(""));
//     currentTurn = "X";
//     io.emit('resetGame');
//   });
// });

// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//   console.log(`Server listening on http://localhost:${PORT}`);

// });


// const express = require("express");
// const app = express();
// const http = require("http").createServer(app);
// const io = require("socket.io")(http);

// app.use(express.static("public")); // serve client files from public folder

// const BOARD_SIZE = 3;
// let board = Array(BOARD_SIZE)
//   .fill(null)
//   .map(() => Array(BOARD_SIZE).fill(""));

// let players = []; // {id: socket.id, symbol: 'X' or 'O'}
// let turn = "X";
// let gameStarted = false;

// function checkWinner(board) {
//   const lines = [
//     // rows
//     [[0, 0], [0, 1], [0, 2]],
//     [[1, 0], [1, 1], [1, 2]],
//     [[2, 0], [2, 1], [2, 2]],
//     // columns
//     [[0, 0], [1, 0], [2, 0]],
//     [[0, 1], [1, 1], [2, 1]],
//     [[0, 2], [1, 2], [2, 2]],
//     // diagonals
//     [[0, 0], [1, 1], [2, 2]],
//     [[0, 2], [1, 1], [2, 0]],
//   ];

//   for (const line of lines) {
//     const [a, b, c] = line;
//     if (
//       board[a[0]][a[1]] &&
//       board[a[0]][a[1]] === board[b[0]][b[1]] &&
//       board[a[0]][a[1]] === board[c[0]][c[1]]
//     ) {
//       return board[a[0]][a[1]];
//     }
//   }

//   // Check draw
//   if (board.flat().every((cell) => cell !== "")) {
//     return "draw";
//   }

//   return null;
// }

// function resetGame() {
//   board = Array(BOARD_SIZE)
//     .fill(null)
//     .map(() => Array(BOARD_SIZE).fill(""));
//   turn = "X";
//   gameStarted = false;
// }

// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   if (players.length >= 2) {
//     socket.emit("room_full");
//     socket.disconnect();
//     return;
//   }

//   // Assign symbol
//   const symbol = players.length === 0 ? "X" : "O";
//   players.push({ id: socket.id, symbol });
//   console.log("Players connected:", players.length);

//   socket.emit("init", { symbol });

//   if (players.length === 2) {
//     gameStarted = true;
//     turn = "X";
//     io.emit("update", { board, turn });
//   } else {
//     socket.emit("message", "Waiting for opponent...");
//   }

//   socket.on("move", (data) => {
//     if (!gameStarted) return;

//     const player = players.find((p) => p.id === socket.id);
//     if (!player) return;

//     // Only accept move if it's player's turn
//     if (turn !== player.symbol) return;

//     const { row, col } = data;
//     if (board[row][col] !== "") return; // spot taken

//     board[row][col] = player.symbol;

//     // Check for winner
//     const winner = checkWinner(board);
//     if (winner) {
//       io.emit("game_over", { board, winner });
//       resetGame();
//       return;
//     }

//     // Switch turn
//     turn = turn === "X" ? "O" : "X";
//     io.emit("update", { board, turn });
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
//     players = players.filter((p) => p.id !== socket.id);

//     if (players.length < 2) {
//       gameStarted = false;
//       board = Array(BOARD_SIZE)
//         .fill(null)
//         .map(() => Array(BOARD_SIZE).fill(""));
//       turn = "X";
//       io.emit("message", "Opponent disconnected. Waiting for new opponent...");
//       io.emit("update", { board, turn }); // reset board for remaining player
//     }
//   });
// });

// const PORT = 3000;
// http.listen(PORT, () => {
//   console.log(`Server listening on http://localhost:${PORT}`);
// });


const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

const BOARD_SIZE = 3;
let board = Array(BOARD_SIZE)
  .fill(null)
  .map(() => Array(BOARD_SIZE).fill(""));

let players = {}; // key: socket.id, value: 'X' or 'O'
let sockets = {}; // key: 'X' or 'O', value: socket
let turn = "X";
let gameStarted = false;
let playAgainVotes = 0;

function checkWinner(board) {
  const lines = [
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [[a1, a2], [b1, b2], [c1, c2]] = lines[i];
    if (
      board[a1][a2] &&
      board[a1][a2] === board[b1][b2] &&
      board[a1][a2] === board[c1][c2]
    ) {
      return {
        winner: board[a1][a2],
        winningLineIndex: i,
      };
    }
  }

  if (board.flat().every((cell) => cell !== "")) {
    return { winner: "draw", winningLineIndex: null };
  }

  return null;
}

function resetGameBoard() {
  board = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(""));
  turn = "X";
  gameStarted = true;
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Assign symbol
  if (!sockets["X"]) {
    players[socket.id] = "X";
    sockets["X"] = socket;
  } else if (!sockets["O"]) {
    players[socket.id] = "O";
    sockets["O"] = socket;
  } else {
    socket.emit("room_full");
    socket.disconnect();
    return;
  }

  const symbol = players[socket.id];
  socket.emit("init", { symbol });

  if (sockets["X"] && sockets["O"]) {
    gameStarted = true;
    resetGameBoard();
    io.emit("update", { board, turn });
  }

  socket.on("move", ({ row, col }) => {
    if (!gameStarted) return;

    const symbol = players[socket.id];
    if (symbol !== turn) return;
    if (board[row][col] !== "") return;

    board[row][col] = symbol;

    const result = checkWinner(board);
    if (result) {
      io.emit("game_over", {
        board,
        winner: result.winner,
        winningLineIndex: result.winningLineIndex,
      });
      gameStarted = false;
      return;
    }

    turn = turn === "X" ? "O" : "X";
    io.emit("update", { board, turn });
  });

  socket.on("play_again", () => {
    playAgainVotes++;
    if (playAgainVotes === 2) {
      resetGameBoard();
      playAgainVotes = 0;
      io.emit("update", { board, turn });
    }
  });

  socket.on("disconnect", () => {
    const symbol = players[socket.id];
    console.log(`Player ${symbol} disconnected`);

    delete players[socket.id];
    delete sockets[symbol];

    gameStarted = false;
    board = Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(""));
    turn = "X";
    playAgainVotes = 0;

    io.emit("message", "Opponent disconnected. Waiting for new player...");
    io.emit("update", { board, turn });
  });
});

const PORT = 3000;
http.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
