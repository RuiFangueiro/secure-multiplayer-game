import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

document.getElementById('start-button').addEventListener('click', startGame);

//GameOver variable
let gameOver = false;

// Array to hold all players
let players = [];

// Array to hold all collectibles
let collectibles = [];

// Current direction of the player, defaults to right
let currentDirection = 'right';

// Start page elements
const startPage = document.getElementById('start-page');
const playerNameInput = document.getElementById('player-name');

export function startGame() {
  const playerName = playerNameInput.value.trim();
  if (playerName !== '') {
    socket.emit('join-game', playerName);
    startPage.style.display = 'none';
    canvas.style.display = 'block';
  } else {
    // Add an alert or message to inform the user to enter a name
    alert('Please enter a player name!');
  }
}

// Socket event when the game starts
socket.on('game-start', () => {
  canvas.style.display = 'block'; // Show the game canvas
});

socket.on('init-player', (playerData) => {
  // Initialize player when receiving player data from server
  const { x, y, score, id } = playerData;
  players.push(new Player({ x, y, score, id, socket }));
});

socket.on('init-collectible', (collectibleData) => {
  // Initialize collectible when receiving collectible data from server
  const { x, y, value, id } = collectibleData;
  collectibles.push(new Collectible({ x, y, value, id }));
});

// Add a test player and collectible
players.push(new Player({x: 0, y: 0, score: 0, id: 'test', socket: socket}));
collectibles.push(new Collectible({x: 100, y: 100, value: 10, id: 'test'}));

// Function to remove a collectible
function removeCollectible(id) {
  collectibles = collectibles.filter(collectible => collectible.id !== id);
}

// Function to update the game state
function update() {
  // Update each player
  for (let player of players) {
    player.movePlayer(currentDirection, 1);
  }

  // Check for collisions between players and collectibles
  for (let player of players) {
    for (let collectible of collectibles) {
      if (player.collision(collectible) && collectible.collision(player)) {
        player.score += collectible.value;
        removeCollectible(collectible.id);
        collectibles.push(new Collectible({x: Math.floor(Math.random() * canvas.width), y: Math.floor(Math.random() * canvas.height), value: 10, id: 'test'}))
      }
    }
  }
}

// Function to draw the game scene
function draw(players) {
  // Clear the canvas
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Draw each player
  for (let player of players) {
    context.fillStyle = player.color;
    context.fillRect(player.x, player.y, player.width, player.height);

  // Draw body
  let bodyColor = lightenColor(player.color, 0.8); // Ajuste o valor 0.2 para a claridade desejada
  context.fillStyle = bodyColor;
  for (let segment of player.segments.slice(1)) { // Ignora a cabeça, desenhe apenas o corpo
    context.fillRect(segment.x, segment.y, player.width, player.height);
  }
  }

  // Draw each collectible
  for (let collectible of collectibles) {
    context.fillStyle = collectible.color;
    context.fillRect(collectible.x, collectible.y, collectible.width, collectible.height);
  }
}

// Função para clarear uma cor em hexadecimal
function lightenColor(hex, percent) {
  if (typeof hex !== 'string') {
    // Se hex não for uma string, retorna uma cor padrão
    return "#FFFFFF"; // Branco
}

// Verifica se hex começa com "#", caso contrário, adiciona
  if (!hex.startsWith("#")) {
    hex = "#" + hex;
  }

  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(255 * percent);
  const R = (num >> 16) + amt;
  const B = (num >> 8 & 0x00FF) + amt;
  const G = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 + (G < 255 ? (G < 1 ? 0 : G) : 255)).toString(16).slice(1);
}

window.addEventListener('keydown', function(event) {
  if (players.length > 0) {
    let speed = 1;
    let newDirection;
    
    switch (event.key) {
      case 'ArrowUp':
        currentDirection = 'up';
        break;
      case 'ArrowDown':
        currentDirection = 'down';
        break;
      case 'ArrowLeft':
        currentDirection = 'left';
        break;
      case 'ArrowRight':
        currentDirection = 'right';
        break;
    }

    // If the pressed key corresponds to a new direction, update the current direction and move the player in the new direction
    if (newDirection && newDirection !== currentDirection) {
      currentDirection = newDirection;
      players[0].movePlayer(currentDirection, speed);
    }
  }
});

function checkCollision(player) {
  // Check for collision with self
  for (let i = 0; i < player.segments.length; i++) {
    if (player.segments[i].x === player.x && player.segments[i].y === player.y) {
      return true;
    }
  }

  // Check for collision with borders
  if (player.x < 0 || player.y < 0 || player.x > canvas.width || player.y > canvas.height) {
    return true;
  }

  // Check for collision with other players
  for (let otherPlayer of players) {
    if (otherPlayer.id !== player.id) {
      if (otherPlayer.x === player.x && otherPlayer.y === player.y) {
        return true;
      }
    }
  }

  return false;
}

// Game loop
function gameLoop() {
  if (!gameOver) {}
    update();
    draw(players);

  // Check for collisions
  for (let player of players) {
    if (checkCollision(player)) {
      // End the game if a collision is detected
      alert('Game Over!');
      gameOver = true;
      socket.emit('game-over', players[0].id);
      return;
    }
  }
  requestAnimationFrame(gameLoop);
}


// Start the game loop
gameLoop();

