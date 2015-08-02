
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
  this.scores = [];
}

PlayState.prototype.enter = function(game) {
  game.invincibleCounter = 0;
  game.score = 0;
  game.rumbleOffset = 0;
  //  Create the ship.
  this.ship = new Ship(game.width / 2, game.gameBounds.bottom);

  //  Set the ship speed for this level, as well as invader params.
  var levelMultiplier = this.level * this.config.levelDifficultyMultiplier;
  this.shipSpeed = this.config.shipSpeed;
  this.invaderInitialVelocity = this.config.invaderInitialVelocity + (levelMultiplier * this.config.invaderInitialVelocity);
  this.bombRate = this.config.bombRate + (levelMultiplier * this.config.bombRate);
  this.bombMinVelocity = this.config.bombMinVelocity + (levelMultiplier * this.config.bombMinVelocity);
  this.bombMaxVelocity = this.config.bombMaxVelocity + (levelMultiplier * this.config.bombMaxVelocity);

        //(game.width / 2) + ((files/2 - file) * 200 / files),
        //(game.gameBounds.topp + rank * 20),

  //  Create the invaders.
  var ranks = this.config.invaderRanks;
  var files = this.config.invaderFiles;
  var invaders = [];
  var startX = game.width / 2 - game.config['ticketWidth'] / 1.2;
  var startY = game.height / 2 - game.config['ticketHeight'] / 1.2;
  for(var rank = 0; rank < ranks; rank++){
    for(var file = 0; file < files; file++) {
      var x = startX + file * game.config.invaderWidth;
      var y = startY + rank * game.config.invaderHeight;
      invaders.push(new Invader(x,
                                y,
                                rank,
                                file,
                                'Invader',
                                game.config.invaderWidth,
                                game.config.invaderHeight));
    }
  }
  this.invaders = invaders;
  this.invaderCurrentVelocity = this.invaderInitialVelocity;
  this.invaderVelocity = {x: -this.invaderInitialVelocity, y:0};
  this.invaderNextVelocity = null;
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
  if(this.mothership_time > game.config.mothershipInterval
      ){
    this.mothership_time = 0;
    if(!this.mothership){
      var pos = game.mothershipLeft ? game.width : 0;
      this.mothership = new Mothership(pos, 50);
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
    var dir = game.mothershipLeft ? -1 : 1;
    ms.x += dt * ms.velocity * dir;
    //  If the rocket has gone off the screen remove it.
    if(ms.x < 0 || ms.x > game.width) {
      game.mothershipLeft = !game.mothershipLeft;
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

      if(rocket.x >= (invader.x) && rocket.x <= (invader.x + invader.width) &&
        rocket.y >= (invader.y) && rocket.y <= (invader.y + invader.height)) {

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


  if(game.invincibleCounter > 0){
    game.invincibleCounter = Math.max(0, game.invincibleCounter - dt);
    game.rumbleCounter = game.rumbleCounter- dt;
    if(game.rumbleCounter <= 0){
      game.rumbleCounter = game.config.rumbleInterval;
      game.rumbleOffset *= -1;
    }
  }
  else if(game.rumbleOffset != 0){
    game.rumbleOffset = 0;
  }

//  Check for bomb/ship collisions.
  for(var i=0; i<this.bombs.length; i++) {
    var bomb = this.bombs[i];
    var ship = this.ship;
    var dist2 = (bomb.x - ship.x) * (bomb.x - ship.x) + (bomb.y - ship.y) * (bomb.y - ship.y);
    if(dist2 <= ship.r2){
      this.bombs.splice(i--, 1);
      if(game.invincibleCounter == 0){
        game.invincibleCounter = game.config.invincibleDuration;
        game.rumbleCounter = game.config.rumbleInterval;
        game.rumbleOffset = game.config.rumbleWidth;
        game.lives--;
        game.playSound('explosion');
      }
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

//  Check for rocket/mothership collisions.
  if(this.mothership && this.rockets.length > 0){
    var rocket = this.rockets[0];
    var ms = this.mothership;

    var dist2 = (rocket.x - ms.x) * (rocket.x - ms.x) + (rocket.y - ms.y) * (rocket.y - ms.y);
    if(dist2 <= ms.r2){
      //  Remove the rocket, set 'bang' so we don't process
      //  this rocket again.
      this.rockets.splice(0, 1);
      this.mothership = null;
      game.mothershipLeft = !game.mothershipLeft;
      game.score += this.config.pointsPerMothership;
      this.scores.push(new Score(ms.x, ms.y, game.config.pointsPerMothership));
    }
  }

  // Decrement scores
  for(var i=0; i<this.scores.length; i++) {
    this.scores[i].duration -= dt;
    if(this.scores[i].duration <= 0){
      this.scores.splice(i--, 1);
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
    card.services('helpdesk').request('ticket:update', game.ticketId, { status: 'closed' });
    game.moveToState(new LevelIntroState(game.level));
  }
};

PlayState.prototype.fireRocket = function() {
  // only fire a rocket if one is not in flight
  if(this.rockets.length == 0){
    this.rockets.push(new Rocket(this.ship.x, this.ship.y - 12, this.config.rocketVelocity));
    game.playSound('laser');
  }
};

PlayState.prototype.draw = function(game, dt, ctx) {

  ctx.drawImage(background, 0, 0, game.width, game.height);

  // Draw lives
  ctx.font="24px Orbitron";
  ctx.fillStyle = font_color;
  var livesY = game.height / 2 - 80;
  ctx.fillText("Lives", game.gameBounds.right + 85, livesY);

  var livesX = game.gameBounds.right + 55;
  var lifeHeight = 55;
  var lifeWidth = 55;
  livesY += lifeHeight / 2;
  for(i = 0; i < game.lives; i++){
    ctx.drawImage(spicerex_head, livesX, livesY + i * lifeHeight, lifeWidth, lifeHeight);
    livesY += 10;
  }

  // Draw score
  ctx.font="24px Orbitron";
  ctx.fillStyle = font_color;
  var scoreY = game.height / 2 - 80;
  ctx.fillText("Score", game.gameBounds.left - 85, scoreY);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(game.score, game.gameBounds.left - 85, scoreY + 30);

  //  Draw ship.
  if(game.invincibleCounter > 0){
    ctx.save();
    ctx.globalAlpha=.5;
    ctx.fillStyle = '#999999';
  }
  var ship_idx = Math.floor(Math.random() * 4);
  ctx.drawImage(spice_ship, this.ship.x - this.ship.width / 2 + game.rumbleOffset, this.ship.y - this.ship.height / 2, this.ship.width, this.ship.height);
  if(game.invincibleCounter > 0){
    ctx.restore();
  }

  //  Draw mothership.
  if(this.mothership != null){
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
    var img = box.getImageData(invader.ticket_x, invader.ticket_y, game.config.invaderWidth, game.config.invaderHeight);
    ctx.putImageData(img, invader.x, invader.y);
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
    ctx.fillStyle = '#ff7300';
    ctx.fillRect(rocket.x, rocket.y - rocket.width / 2, rocket.width, rocket.height);
  }

  // Draw scores
  for(var i=0; i<this.scores.length; i++) {
    var score = this.scores[i];
    ctx.font="20px Orbitron";
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(score.value, score.x, score.y);
  }

};
