function Ship(x, y) {
  this.x = x;
  this.y = y;
  this.width = 80;
  this.height = 80;
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
  this.width = 5;
  this.height= 20;
  this.velocity = velocity;
}

function Bomb(x, y, velocity) {
  this.x = x;
  this.y = y;
  this.velocity = velocity;
}

function Invader(x, y, rank, file, type, width, height) {
  this.x = x;
  this.y = y;
  this.ticket_x = x;
  this.ticket_y = y;
  this.rank = rank;
  this.file = file;
  this.type = type;
  this.width = width;
  this.height = height;
}

function Score(x, y, value) {
  this.x = x;
  this.y = y;
  this.value = value;
  this.duration = 1;
}
