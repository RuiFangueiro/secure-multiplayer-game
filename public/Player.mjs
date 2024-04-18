class Player {
  constructor({x, y, score, id, socket = { on: () => {} }, io = { on: () => {} }}) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
    this.socket = socket;
    this.io = io;
    this.color = '#0000FF';
    this.width = 20;
    this.height = 20; 
    this.speed = 5;
    this.segments = [{x: this.x, y: this.y}];

    // Listen for events
    this.socket.on('playerConnected', this.addPlayer.bind(this));
    this.socket.on('playerDisconnected', this.removePlayer.bind(this));
  }

  collision(collectible) {
    return (
      this.x + this.width > collectible.x &&
      this.x < collectible.x + collectible.width &&
      this.y + this.height > collectible.y &&
      this.y < collectible.y + collectible.height)
  }

  movePlayer(dir, speed) {
    // Create a new segment at the current head position
    let newSegment = {x: this.x, y: this.y};

    // Add the new segment to the beginning of the segments array
    this.segments.unshift(newSegment);

    // Remove the last segment of the snake if it hasn't eaten a collectible
    if (this.segments.length > this.score + 1) {
      this.segments.pop();
    }

    switch (dir) {
      case 'up':
        this.y -= speed;
        break;
      case 'down':
        this.y += speed;
        break;
      case 'left':
        this.x -= speed;
        break;
      case 'right':
        this.x += speed;
        break;
    }
  }

  calculateRank(arr) {
    const sortedScores = arr.map(player => player.score).sort((a, b) => b - a); // Extract and sort scores
    const rank = sortedScores.filter(score => score >= this.score).length; // Get all scores greater or equal to player's score
    return `Rank: ${rank} / ${arr.length}`;
  }
  
  addPlayer(id) {
    let newPlayer = new Player({x: 0, y: 0, score: 0, id: id, socket: this.socket, io: this.io});
    players.push(newPlayer);
  }

  removePlayer(id) {
    players = players.filter(player => player.id !== id);
  }
}

let players = [];
let socket = io();

// Listen for events

socket.on('playerConnected', function(id) {
  let newPlayer = new Player({x: 0, y: 0, score: 0, id: id, socket: socket});
  players.push(newPlayer);
});

socket.on('playerDisconnected', function(id) {
  players = players.filter(player => player.id !== id);
});

function gameUpdate() {
  players.forEach(player => {
    // Update each player
  });
}

export default Player;
