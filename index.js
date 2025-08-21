'use strict';

const N = 100; // Grid size (50x50)
const CELL_SIZE = 5; // Size of each cell in pixels

let matrix = [];

function initializeMatrix() {
  matrix = [];
  for (let i = 0; i < N; i++) {
    matrix[i] = [];
    for (let j = 0; j < N; j++) {
      matrix[i][j] = (Math.random() < 0.1);
    }
  }
}

function onLoad() {
  const canvas = document.getElementById('sim');
  canvas.width = N * CELL_SIZE;
  canvas.height = N * CELL_SIZE;
  initializeMatrix();
  draw();
  updateTemperatureDisplay();
  setInterval(update, 10);
}

// Render the matrix
function draw() {
  // Get canvas and context
  const canvas = document.getElementById('sim');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw each cell
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      ctx.fillStyle = matrix[i][j] ? '#6060ff' : '#fff';
      ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
}

function arraySum(array) {
  // Sum of given array, ignoring undefined values in the array.
  return array.reduce((acc, curVal) => (curVal ? acc + curVal : acc), 0);
}

function getTemp() {
  return parseFloat(document.getElementById("temp-range").value);
}

function getMoveMethod() {
  if (document.getElementById('move-adjacent').checked) {
    return 'adjacent';
  } else {
    return 'teleport';
  }
}

// Update function (called every 100ms)
function update() {
  const neighborDeltas = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const temp = getTemp();
  // Choose 20% of cells to potentially modify
  const cellsToFlip = N * N * 0.20;
  for (let i = 0; i < cellsToFlip; i++) {
    const srcX = Math.floor(Math.random() * N);
    const srcY = Math.floor(Math.random() * N);
    let dstX, dstY;
    switch(getMoveMethod()) {
      case 'adjacent':
        const dx = Math.floor(Math.random() * 3) - 1;
        const dy = Math.floor(Math.random() * 3) - 1;
        dstX = srcX + dx;
        dstY = srcY + dy;
        break;
      case 'teleport':
        dstX = Math.floor(Math.random() * N);
        dstY = Math.floor(Math.random() * N);
        break;
      default:
        raise ('Invalid move method: ' + getMoveMethod());
    }
    if (dstX == srcX && dstY == srcY) continue;
    if (dstX < 0 || dstX >= N || dstY < 0 || dstY > N) continue;
    if (!matrix[srcX][srcY]) continue;
    if (matrix[dstX][dstY]) continue;
    // We have a molecule at (srcX,srcY) and want to consider moving it to (dstX,dstY).
    // Compute energy level before and after the potential move.
    matrix[srcX][srcY] = false;  // Remove the molecule so as not to affect energy calculation.
    // The ugly notation ensures that the result of the map will be undefined when looking
    // beyond the matrix bound (and will not raise an exception).
    const E1 = -arraySum(neighborDeltas.map(delta => (matrix[srcX+delta[0]] || [])[srcY+delta[1]]));
    const E2 = -arraySum(neighborDeltas.map(delta => (matrix[dstX+delta[0]] || [])[dstY+delta[1]]));
    const deltaE = E2-E1;
    const q = 1 / (1 + Math.exp(deltaE/temp));
    if (Math.random() < q) {
      // Swap
      matrix[dstX][dstY] = true;
    } else {
      // Restore original position
      matrix[srcX][srcY] = true;
    }
  }
  
  // Redraw after update
  draw();
}

function updateTemperatureDisplay() {
  document.getElementById('temp-value').textContent = getTemp().toFixed(2);
}
