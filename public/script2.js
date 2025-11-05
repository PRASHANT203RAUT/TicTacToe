const socket = io();

const cells = document.querySelectorAll(".cell");
const statusDiv = document.getElementById("status");
const strike = document.getElementById("strike");

let symbol = null;  // Your player symbol 'X' or 'O'
let turn = "X";     // Whose turn is it (from server)
const mat = [       // The game board matrix (3x3)
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
];

strike.style.display = "none";

disableBoard();

socket.on("connect", () => {
  statusDiv.textContent = "Connected. Waiting for opponent...";
});

socket.on("init", (data) => {
  symbol = data.symbol;
  statusDiv.textContent = `You are Player ${symbol}. Waiting for your turn...`;
  if (symbol === "X") {
    turn = "X";
    enableBoardForTurn();
  }
});

socket.on("update", (data) => {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      mat[i][j] = data.board[i][j];
    }
  }
  turn = data.turn;

  updateUI();

  strike.style.display = "none"; // Hide strike on ongoing game

  if (turn === symbol) {
    statusDiv.textContent = "Your turn!";
    enableBoardForTurn();
  } else {
    statusDiv.textContent = `Opponent's turn (${turn})`;
    disableBoard();
  }
});

socket.on("game_over", (data) => {
  // Update board
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      mat[i][j] = data.board[i][j];
    }
  }
  updateUI();
  disableBoard();

  if (data.winner === "draw") {
    statusDiv.textContent = "It's a draw! 😐";
    strike.style.display = "none";
  } else {
    statusDiv.textContent = `${data.winner} wins! 🎉`;
    if (data.winner === symbol) {
      showConfetti();
    }
    if (data.winningLineIndex !== undefined) {
      positionStrikeLine(data.winningLineIndex);
    } else {
      strike.style.display = "none";
    }
  }
});

socket.on("room_full", () => {
  statusDiv.textContent = "Room is full, cannot join.";
  disableBoard();
});

function updateUI() {
  cells.forEach((cell, index) => {
    const [r, c] = getRowCol(index);
    cell.textContent = mat[r][c];
  });
}

function disableBoard() {
  cells.forEach(cell => (cell.disabled = true));
}

function enableBoardForTurn() {
  cells.forEach((cell, index) => {
    const [r, c] = getRowCol(index);
    cell.disabled = mat[r][c] !== "";
  });
}

cells.forEach((cell, index) => {
  cell.addEventListener("click", () => {
    if (turn !== symbol) return; // not your turn
    const [r, c] = getRowCol(index);
    if (mat[r][c] !== "") return; // already filled
    socket.emit("move", { row: r, col: c });
  });
});

function getRowCol(index) {
  return [Math.floor(index / 3), index % 3];
}

function showConfetti() {
  confetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.6 },
  });
}

function positionStrikeLine(index) {
  const cellSize = 150;

  // Reset styles
  strike.style.width = "100%";
  strike.style.height = "10px";
  strike.style.top = "0";
  strike.style.left = "0";
  strike.style.transform = "none";
  strike.style.display = "block";

  switch (index) {
    case 0: // Row 0
      strike.style.top = `${cellSize * 0 + cellSize / 2 - 5}px`;
      break;
    case 1: // Row 1
      strike.style.top = `${cellSize * 1 + cellSize / 2 - 5}px`;
      break;
    case 2: // Row 2
      strike.style.top = `${cellSize * 2 + cellSize / 2 - 5}px`;
      break;
    case 3: // Col 0
      strike.style.transform = "rotate(90deg)";
      strike.style.left = `${cellSize * 0 + cellSize / 2 - 5}px`;
      break;
    case 4: // Col 1
      strike.style.transform = "rotate(90deg)";
      strike.style.left = `${cellSize * 1 + cellSize / 2 - 5}px`;
      break;
    case 5: // Col 2
      strike.style.transform = "rotate(90deg)";
      strike.style.left = `${cellSize * 2 + cellSize / 2 - 5}px`;
      break;
    case 6: // Diagonal \
      strike.style.width = "120%";
      strike.style.transform = "rotate(45deg)";
      strike.style.top = `39px`;
      strike.style.left = `35px`;
      break;
    case 7: // Diagonal /
      strike.style.width = "120%";
      strike.style.transform = "rotate(-45deg)";
      strike.style.top = `430px`;
      strike.style.left = `30px`;
      break;
  }
}
const playAgainBtn = document.getElementById("play-again");
playAgainBtn.style.display = "none";

socket.on("game_over", (data) => {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      mat[i][j] = data.board[i][j];
    }
  }

  updateUI();
  disableBoard();

  if (data.winner === "draw") {
    statusDiv.textContent = "It's a draw! 😐";
    strike.style.display = "none";
  } else {
    statusDiv.textContent = `${data.winner} wins! 🎉`;
    if (data.winner === symbol) showConfetti();
    if (data.winningLineIndex !== undefined) {
      positionStrikeLine(data.winningLineIndex);
    }
  }

  playAgainBtn.style.display = "inline-block";
});

playAgainBtn.addEventListener("click", () => {
  socket.emit("play_again");
  playAgainBtn.style.display = "none";
  strike.style.display = "none";
  statusDiv.textContent = "Waiting for opponent to confirm replay...";
});
