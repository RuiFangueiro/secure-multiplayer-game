const socket = io();

class Collectible {
  constructor({x, y, value, id, socket = { on: () => {} }, io = { on: () => {} }}) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.id = id;
    this.socket = socket;
    this.io = io;
    this.width = 10;
    this.height = 10;
    this.color = 'yellow';  
  }

  collision(player) {
    return (
      player.x + player.width > this.x &&
      player.x < this.x + this.width &&
      player.y + player.height > this.y &&
      player.y < this.y + this.height)
  }
}

let collectibles = [];

function addCollectible(id) {
  let newCollectible = new Collectible({x: 0, y: 0, value: 10, id: id, socket: socket, io: io});
  collectibles.push(newCollectible);
}

function removeCollectible(id) {
  collectibles = collectibles.filter(collectible => collectible.id !== id);
}

socket.on('collectibleAdded', function(id) {
  addCollectible(id);
});

socket.on('collectibleRemoved', function(id) {
  removeCollectible(id);
});

function drawCollectibles(ctx) {
  for (let collectible of collectibles) {
    ctx.fillStyle = collectible.color;
    ctx.fillRect(collectible.x, collectible.y, collectible.width, collectible.height);
  }
}

export default Collectible;
export {
  collectibles,
  addCollectible,
  removeCollectible,
  drawCollectibles
};
