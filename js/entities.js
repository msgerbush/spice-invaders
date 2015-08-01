/*
  The ship has a position and that's about it.
*/
function Ship(x, y) {
  this.x = x;
  this.y = y;
  this.width = 20;
  this.height = 16;
}

/*
  Fired by the ship, they've got a position and velocity.
  */
function Rocket(x, y, velocity) {
  this.x = x;
  this.y = y;
  this.velocity = velocity;
}

/*
  Dropped by invaders, they've got position and velocity.
*/
function Bomb(x, y, velocity) {
  this.x = x;
  this.y = y;
  this.velocity = velocity;
}

/*
  Invaders have position, type, rank/file and that's about it. 
*/

function Invader(x, y, rank, file, type) {
  this.x = x;
  this.y = y;
  this.rank = rank;
  this.file = file;
  this.type = type;
  this.width = 18;
  this.height = 14;
}
