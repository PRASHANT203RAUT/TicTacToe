const cells = document.querySelectorAll(".cell");
let turn = "X";
const mat = [];
for (let i = 0; i < 3; i++) {
  mat[i] = [];
  for (let j = 0; j < 3; j++) {
    mat[i][j] = "";
  }
}
function callMat(){
console.log(mat)
}

function showConfetti() {
    confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 }
    });
}

function getRowCol(index){
  
    console.log(index)
    return [Math.floor(index/3),index%3]
}
function IsBoardFilled(){
    
    for(let i=0;i<3;i++){
        for(let j=0;j<3;j++){
            if(mat[i][j]==="")
                return false
        }
    }
    return true
}

function canAnyoneStillWin() {
  const winningLines = [
    [[0, 0], [0, 1], [0, 2]], 
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    [[0, 0], [1, 0], [2, 0]], 
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    [[0, 0], [1, 1], [2, 2]], 
    [[0, 2], [1, 1], [2, 0]],
  ];

  for (let line of winningLines) {
    let values = line.map(([r, c]) => mat[r][c]);

    if (
      values.includes("") &&
      !(values.includes("X") && values.includes("O"))
    ) {
      return true; 
    }
  }

  return false; 
}

function positionStrikeLine(index) {
  const strike = document.getElementById("strike");
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
      strike.style.top = `39px`;   // ~70px
      strike.style.left = `35px`;  // ~70px
    
      break;
    case 7: // Diagonal /
     strike.style.width = "120%";
      strike.style.transform = "rotate(-45deg)";
      strike.style.top = `430px`;  // ~370px
      strike.style.left = `30px`;                // ~70px
      break;
  }
}






// function checkWinner() {
//   let winner = "None";
//     let winningLineIndex = -1;

//   for (let i = 0; i < 3; i++) {
//     if (mat[i][0] && mat[i][0] === mat[i][1] && mat[i][0] === mat[i][2])
//     {

//       winner = mat[i][0];
//       winningLineIndex = i;
//     }
      
//     if (mat[0][i] && mat[0][i] === mat[1][i] && mat[0][i] === mat[2][i])
//      {winner = mat[0][i];
//       winningLineIndex = i;
//      }
      
//   }

//   if (mat[0][0] && mat[0][0] === mat[1][1] && mat[1][1] === mat[2][2])
//     winner = mat[0][0];

//   if (mat[0][2] && mat[0][2] === mat[1][1] && mat[1][1] === mat[2][0])
//     winner = mat[0][2];

//   const strike = document.getElementById("strike");
  


//   const statusDiv = document.getElementById("status");

//   if (winner !== "None") {
//     statusDiv.textContent = `${winner} wins! 🎉`;
//     positionStrikeLine(win); 
//       strike.style.display = "block";
//     showConfetti();
//     disableBoard();
//     return;
//   }

//   if (!canAnyoneStillWin()) {
//     statusDiv.textContent = `It's a draw (early detection) 😐`;
//     disableBoard();
//     return;
//   }

//   if (IsBoardFilled()) {
//     statusDiv.textContent = `It's a draw 😐`;
//     disableBoard();
//   }
// }

function disableBoard() {
  cells.forEach(cell => {
    cell.disabled = true;
  });
}
function checkWinner() {
  let winner = "None";
  let winningLineIndex = -1;

  // Rows
  for (let i = 0; i < 3; i++) {
    if (mat[i][0] && mat[i][0] === mat[i][1] && mat[i][0] === mat[i][2]) {
      winner = mat[i][0];
      winningLineIndex = i; // 0,1,2
      break;
    }
  }

  // Columns
  if (winner === "None") {
    for (let i = 0; i < 3; i++) {
      if (mat[0][i] && mat[0][i] === mat[1][i] && mat[0][i] === mat[2][i]) {
        winner = mat[0][i];
        winningLineIndex = 3 + i; // 3,4,5
        break;
      }
    }
  }

  // Diagonals
  if (winner === "None") {
    if (mat[0][0] && mat[0][0] === mat[1][1] && mat[1][1] === mat[2][2]) {
      winner = mat[0][0];
      winningLineIndex = 6;
    } else if (mat[0][2] && mat[0][2] === mat[1][1] && mat[1][1] === mat[2][0]) {
      winner = mat[0][2];
      winningLineIndex = 7;
    }
  }

  const statusDiv = document.getElementById("status");
  const strike = document.getElementById("strike");

  if (winner !== "None") {
    statusDiv.textContent = `${winner} wins! 🎉`;
    positionStrikeLine(winningLineIndex);
    strike.style.display = "block";
    showConfetti();
    disableBoard(); // ✅ disables clicking
    return;
  }

  if (!canAnyoneStillWin()) {
    statusDiv.textContent = `It's a draw (early detection) 😐`;
    disableBoard();
    return;
  }

  if (IsBoardFilled()) {
    statusDiv.textContent = `It's a draw 😐`;
    disableBoard();
  }
}




  

cells.forEach((cell,index) => {
  cell.addEventListener("click", () => {

    const [row,col]=getRowCol(index) 
    console.log(row+" "+col)
    if (mat[row][col] === "") {
        // callMat()
        mat[row][col]=turn
      cell.textContent = turn;
      turn = turn === "X" ? "O" : "X";
      checkWinner();
    }
  });
});















