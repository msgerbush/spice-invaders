function Ship(x, y) {
  this.x = x;
  this.y = y;
  this.width = 80;
  this.height = 64;
  this.r2 = this.height * this.height / 4;
}

function Mothership(x, y) {
  this.x = x;
  this.y = y;
  this.width = 80;
  this.height = 64;
  this.r2 = this.height * this.height / 4;
  this.idx = mothership_index
  this.velocity = 120;
  mothership_index = (mothership_index + 1) % 4
}

function Rocket(x, y, velocity) {
  this.x = x;
  this.y = y;
  this.velocity = velocity;
}

function Bomb(x, y, velocity) {
  this.x = x;
  this.y = y;
  this.velocity = velocity;
}

function Invader(x, y, rank, file, type) {
  this.x = x;
  this.y = y;
  this.rank = rank;
  this.file = file;
  this.type = type;
  this.width = 18;
  this.height = 14;
}
