
function PlayState(config, level) {
  this.config = config;
  this.level = level;

  //  Game state
  this.invaderCurrentVelocity =  10;
  this.invaderCurrentDropDistance =  0;
  this.invadersAreDropping =  false;

  //  Game entities.
  this.ship = null;
  this.mothership = null;
  this.invaders = [];
  this.rockets = [];
  this.bombs = [];
}

PlayState.prototype.enter = function(game) {
  //  Create the ship.
  this.ship = new Ship(game.width / 2, game.gameBounds.bottom);

  //  Set the ship speed for this level, as well as invader params.
  var levelMultiplier = this.level * this.config.levelDifficultyMultiplier;
  this.shipSpeed = this.config.shipSpeed;
  this.invaderInitialVelocity = this.config.invaderInitialVelocity + (levelMultiplier * this.config.invaderInitialVelocity);
  this.bombRate = this.config.bombRate + (levelMultiplier * this.config.bombRate);
  this.bombMinVelocity = this.config.bombMinVelocity + (levelMultiplier * this.config.bombMinVelocity);
  this.bombMaxVelocity = this.config.bombMaxVelocity + (levelMultiplier * this.config.bombMaxVelocity);

  //  Create the invaders.
  var ranks = this.config.invaderRanks;
  var files = this.config.invaderFiles;
  var invaders = [];
  for(var rank = 0; rank < ranks; rank++){
    for(var file = 0; file < files; file++) {
      invaders.push(new Invader(
        (game.width / 2) + ((files/2 - file) * 200 / files),
        (game.gameBounds.topp + rank * 20),
        rank, file, 'Invader'));
    }
  }
  this.invaders = invaders;
  this.invaderCurrentVelocity = this.invaderInitialVelocity;
  this.invaderVelocity = {x: -this.invaderInitialVelocity, y:0};
  this.invaderNextVelocity = null;
  this.mothership_interval = 10;
  this.mothership_time = 0;
};

 PlayState.prototype.update = function(game, dt) {
  this.mothership_time += dt;
  //  If the left or right arrow keys are pressed, move
  //  the ship. Check this on ticks rather than via a keydown
  //  event for smooth movement, otherwise the ship would move
  //  more like a text editor caret.
  if(game.pressedKeys[37]) {
    this.ship.x -= this.shipSpeed * dt;
  }
  if(game.pressedKeys[39]) {
    this.ship.x += this.shipSpeed * dt;
  }
  if(game.pressedKeys[32]) {
    this.fireRocket();
  }
 
  //  Keep the ship in bounds.
  if(this.ship.x < game.gameBounds.left) {
    this.ship.x = game.gameBounds.left;
  }
  if(this.ship.x > game.gameBounds.right) {
    this.ship.x = game.gameBounds.right;
  }

  // Create a mothership
  if(this.mothership_time > this.mothership_interval){
    this.mothership_time = 0;
    if(!this.mothership){
      this.mothership = new Mothership(game.width, 50);
    }
  }

//  Move each bomb.
  for(var i=0; i<this.bombs.length; i++) {
    var bomb = this.bombs[i];
    bomb.y += dt * bomb.velocity;

    //  If the bomb has gone off the screen remove it.
    if(bomb.y > this.height) {
      this.bombs.splice(i--, 1);
    }
  }

  //  Move each rocket.
  for(i=0; i<this.rockets.length; i++) {
    var rocket = this.rockets[i];
    rocket.y -= dt * rocket.velocity;

    //  If the rocket has gone off the screen remove it.
    if(rocket.y < 0) {
      this.rockets.splice(i--, 1);
    }
  }
 //  Move the invaders.
  var hitLeft = false, hitRight = false, hitBottom = false;
  for(i=0; i<this.invaders.length; i++) {
    var invader = this.invaders[i];
    var newx = invader.x + this.invaderVelocity.x * dt;
    var newy = invader.y + this.invaderVelocity.y * dt;
    if(hitLeft === false && newx < game.gameBounds.left) {
      hitLeft = true;
    }
    else if(hitRight === false && newx > game.gameBounds.right) {
      hitRight = true;
    }
    else if(hitBottom === false && newy > game.gameBounds.bottom) {
      hitBottom = true;
    }
 
    if(!hitLeft && !hitRight && !hitBottom) {
      invader.x = newx;
      invader.y = newy;
    }
  }

  // Move the mothership
  if(this.mothership) {
    var ms = this.mothership;
    ms.x -= dt * ms.velocity;
    //  If the rocket has gone off the screen remove it.
    console.log(ms.x);
    if(ms.x < 0) {
      this.mothership = null;
    }
  }

  //  Update invader velocities.
  if(this.invadersAreDropping) {
    this.invaderCurrentDropDistance += this.invaderVelocity.y * dt;
    if(this.invaderCurrentDropDistance >= this.config.invaderDropDistance) {
      this.invadersAreDropping = false;
      this.invaderVelocity = this.invaderNextVelocity;
      this.invaderCurrentDropDistance = 0;
    }
  }
  //  If we've hit the left, move down then right.
  if(hitLeft) {
    this.invaderCurrentVelocity += this.config.invaderAcceleration;
    this.invaderVelocity = {x: 0, y:this.invaderCurrentVelocity };
    this.invadersAreDropping = true;
    this.invaderNextVelocity = {x: this.invaderCurrentVelocity , y:0};
  }
  //  If we've hit the right, move down then left.
  if(hitRight) {
    this.invaderCurrentVelocity += this.config.invaderAcceleration;
    this.invaderVelocity = {x: 0, y:this.invaderCurrentVelocity };
    this.invadersAreDropping = true;
    this.invaderNextVelocity = {x: -this.invaderCurrentVelocity , y:0};
  }
  //  If we've hit the bottom, it's game over.
  if(hitBottom) {
    this.lives = 0;
  }

//  Check for rocket/invader collisions.
  for(i=0; i<this.invaders.length; i++) {
    var invader = this.invaders[i];
    var bang = false;

    for(var j=0; j<this.rockets.length; j++){
      var rocket = this.rockets[j];

      if(rocket.x >= (invader.x - invader.width/2) && rocket.x <= (invader.x + invader.width/2) &&
        rocket.y >= (invader.y - invader.height/2) && rocket.y <= (invader.y + invader.height/2)) {

        //  Remove the rocket, set 'bang' so we don't process
        //  this rocket again.
        this.rockets.splice(j--, 1);
        bang = true;
        game.score += this.config.pointsPerInvader;
        break;
      }
    }
    if(bang) {
      this.invaders.splice(i--, 1);
    }
  }
//  Find all of the front rank invaders.
  var frontRankInvaders = {};
  for(var i=0; i<this.invaders.length; i++) {
    var invader = this.invaders[i];
    //  If we have no invader for game file, or the invader
    //  for game file is futher behind, set the front
    //  rank invader to game one.
    if(!frontRankInvaders[invader.file] || frontRankInvaders[invader.file].rank < invader.rank) {
      frontRankInvaders[invader.file] = invader;
    }
  }
 
  //  Give each front rank invader a chance to drop a bomb.
  for(var i=0; i<this.config.invaderFiles; i++) {
    var invader = frontRankInvaders[i];
    if(!invader) continue;
    var chance = this.bombRate * dt;
    if(chance > Math.random()) {
      //  Fire!
      this.bombs.push(new Bomb(invader.x, invader.y + invader.height / 2,
        this.bombMinVelocity + Math.random()*(this.bombMaxVelocity - this.bombMinVelocity)));
    }
  }


//  Check for bomb/ship collisions.
  for(var i=0; i<this.bombs.length; i++) {
    var bomb = this.bombs[i];
    if(bomb.x >= (this.ship.x - this.ship.width/2) && bomb.x <= (this.ship.x + this.ship.width/2) &&
        bomb.y >= (this.ship.y - this.ship.height/2) && bomb.y <= (this.ship.y + this.ship.height/2)) {
      this.bombs.splice(i--, 1);
      game.lives--;
      game.playSound('explosion');
    }
  }

//  Check for invader/ship collisions.
  for(var i=0; i<this.invaders.length; i++) {
    var invader = this.invaders[i];
    if((invader.x + invader.width/2) > (this.ship.x - this.ship.width/2) && 
      (invader.x - invader.width/2) < (this.ship.x + this.ship.width/2) &&
      (invader.y + invader.height/2) > (this.ship.y - this.ship.height/2) &&
      (invader.y - invader.height/2) < (this.ship.y + this.ship.height/2)) {
      //  Dead by collision!
      game.lives = 0;
      game.playSound('explosion');
    }
  }
//  Check for failure
  if(game.lives <= 0) {
    game.moveToState(new GameOverState());
  }

  //  Check for victory
  if(this.invaders.length === 0) {
    game.score += this.level * 50;
    game.level += 1;
    game.moveToState(new LevelIntroState(game.level));
  }
};

PlayState.prototype.fireRocket = function() {
  // only fire a rocket if one is not in flight
  if(this.rockets.length == 0){
    this.rockets.push(new Rocket(this.ship.x, this.ship.y - 12, this.config.rocketVelocity));
  }
};

PlayState.prototype.draw = function(game, dt, ctx) {
  ctx.drawImage(background, 0, 0, game.width, game.height);

  //  Draw ship.
  ctx.fillStyle = '#999999';
  var ship_idx = Math.floor(Math.random() * 4);
  ctx.drawImage(motherships[ship_idx], this.ship.x - this.ship.width / 2, this.ship.y - this.ship.height / 2, this.ship.width, this.ship.height);

  //  Draw mothership.
  if(this.mothership != null){
    //console.log(this.mothership);
    //console.log('drawing ms');
    //console(this.mothership.x - this.mothership.width / 2);
    //console(this.mothership.y - this.mothership.height / 2);
    ctx.fillStyle = '#999999';
    ctx.drawImage(motherships[this.mothership.idx],
                  this.mothership.x - this.mothership.width / 2,
                  this.mothership.y - this.mothership.height / 2,
                  this.mothership.width,
                  this.mothership.height);
  }

  //  Draw invaders.
  ctx.fillStyle = '#006600';
  for(var i=0; i<this.invaders.length; i++) {
    var invader = this.invaders[i];
    ctx.fillRect(invader.x - invader.width/2, invader.y - invader.height/2, invader.width, invader.height);
  }

  //  Draw bombs.
  ctx.fillStyle = '#ff5555';
  for(var i=0; i<this.bombs.length; i++) {
    var bomb = this.bombs[i];
    ctx.drawImage(spice_bomb, bomb.x, bomb.y - 2, 20, 20);
  }

  //  Draw rockets.
  ctx.fillStyle = '#ff0000';
  for(var i=0; i<this.rockets.length; i++) {
    var rocket = this.rockets[i];
    ctx.drawImage(spice_rocket, rocket.x, rocket.y - 2, 10, 30);
  }

};
