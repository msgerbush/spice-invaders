var spice_rocket = new Image();
spice_rocket.src = 'img/pepper_40px.png';

function Game() {
  // Set the initial config.
  this.config = {
    bombRate: 0.05,
    bombMinVelocity: 300,
    bombMaxVelocity: 300,
    invaderInitialVelocity: 25,
    invaderAcceleration: 0,
    invaderDropDistance: 20,
    rocketVelocity: 400,
    rocketMaxFireRate: 2,
    gameWidth: 400,
    gameHeight: 300,
    fps: 50,
    debugMode: false,
    invaderRanks: 5,
    invaderFiles: 10,
    shipSpeed: 200,
    levelDifficultyMultiplier: 0.2,
    pointsPerInvader: 5
  };

  // All state is in the variables below.
  this.lives = 1;
  this.width = 0;
  this.height = 0;
  this.level = 1;
  this.gameBound = {left: 0, top: 0, right: 0, bottom: 0};

  //  The state stack.
  this.stateStack = [];

  //  Input/output
  this.pressedKeys = {};
  this.gameCanvas = null;
}

// constructor thingy
Game.prototype.initialise = function(gameCanvas) {
  //  Set the game canvas.
  this.gameCanvas = gameCanvas;

  //  Set the game width and height.
  this.width = gameCanvas.width;
  this.height = gameCanvas.height;

  //  Set the state game bounds.
  this.gameBounds = {
    left: gameCanvas.width / 2 - this.config.gameWidth / 2,
    right: gameCanvas.width / 2 + this.config.gameWidth / 2,
    top: gameCanvas.height / 2 - this.config.gameHeight / 2,
    bottom: gameCanvas.height / 2 + this.config.gameHeight / 2,
  };
};

Game.prototype.currentState = function() {
  return this.stateStack.length > 0 ? this.stateStack[this.stateStack.length - 1] : null;
}

Game.prototype.moveToState = function(state) {
  //  Are we already in a state?
  if(this.currentState()) {

    //  Before we pop the current state, see if the
    //  state has a leave function. If it does we can call it.
    if(this.currentState().leave) {
       this.currentState().leave(game);
    }

    this.stateStack.pop();
  }

  //  If there's an enter function for the new state, call it.
  if(state.enter) {
    state.enter(game);
  }

  //  Set the current state.
  this.stateStack.push(state);
};

Game.prototype.moveToState = function(state) {

  //  Are we already in a state?
  if(this.currentState()) {

    //  Before we pop the current state, see if the 
    //  state has a leave function. If it does we can call it.
    if(this.currentState().leave) {
       this.currentState().leave(game);
    }

    this.stateStack.pop();
  }

  //  If there's an enter function for the new state, call it.
  if(state.enter) {
    state.enter(game);
  }

  //  Set the current state.
  this.stateStack.push(state);
};

Game.prototype.pushState = function(state) {
  //  If there's an enter function for the new state, call it.
  if(state.enter) {
    state.enter(game);
  }
  //  Set the current state.
  this.stateStack.push(state);
};

Game.prototype.popState = function() {
  //  Leave and pop the state.
  if(this.currentState()) {
    if(this.currentState().leave) {
      this.currentState().leave(game);
    }

    //  Set the current state.
    this.stateStack.pop();
  }
};

// The main loop.
function gameLoop(game) {
  var currentState = game.currentState();
  if(currentState) {
    //  Delta t is the time to update/draw.
    var dt = 1 / game.config.fps;

    //  Get the drawing context.
    var ctx = game.gameCanvas.getContext("2d");

    //  Update if we have an update function. Also draw
    //  if we have a draw function.
    if(currentState.update) {
      currentState.update(game, dt);
    }
    if(currentState.draw) {
      currentState.draw(game, dt, ctx);
    }
  }
}

//  Start the Game.
Game.prototype.start = function() {
  //  Move into the 'welcome' state.
  this.moveToState(new WelcomeState());

  //  Set the game variables.
  this.lives = 1;
  this.config.debugMode = /debug=true/.test(window.location.href);

  //  Start the game loop.
  var game = this;
  this.intervalId = setInterval(function () { gameLoop(game);}, 1000 / this.config.fps);

};

function WelcomeState() {

}

WelcomeState.prototype.draw = function(game, dt, ctx) {
  //  Clear the background.
  ctx.clearRect(0, 0, game.width, game.height);

  ctx.font="30px Arial";
  ctx.fillStyle = '#000000';
  ctx.textBaseline="center";
  ctx.textAlign="center";
  ctx.fillText("Space Invaders", game.width / 2, game.height/2 - 40);
  ctx.font="16px Arial";

  ctx.fillText("Press 'Space' to start.", game.width / 2, game.height/2);
};

WelcomeState.prototype.keyDown = function(game, keyCode) {
  if(keyCode == 32) /*space*/ {
    //  Space starts the game.
    game.moveToState(new LevelIntroState(game.level));
  }
};

 //  Inform the game a key is down.
Game.prototype.keyDown = function(keyCode) {
  this.pressedKeys[keyCode] = true;
  //  Delegate to the current state too.
  if(this.currentState() && this.currentState().keyDown) {
    this.currentState().keyDown(this, keyCode);
  }
};

//  Inform the game a key is up.
Game.prototype.keyUp = function(keyCode) {
  delete this.pressedKeys[keyCode];
  //  Delegate to the current state too.
  if(this.currentState() && this.currentState().keyUp) {
    this.currentState().keyUp(this, keyCode);
  }
};

/*  
  Level Intro State
 
  The Level Intro state shows a 'Level X' message and
  a countdown for the level.
*/
function LevelIntroState(level) {
  this.level = level;
  this.countdownMessage = "1";
}

LevelIntroState.prototype.enter = function(game) {
  game.lives = 1
}

LevelIntroState.prototype.draw = function(game, dt, ctx) {

  //  Clear the background.
  ctx.clearRect(0, 0, game.width, game.height);

  ctx.font="36px Arial";
  ctx.fillStyle = '#000000';
  ctx.textBaseline="middle";
  ctx.textAlign="center";
  ctx.fillText("Level " + this.level, game.width / 2, game.height/2);
  ctx.font="24px Arial";
  ctx.fillText("Ready in " + this.countdownMessage, game.width / 2, game.height/2 + 36);
};

LevelIntroState.prototype.update = function(game, dt) {

  //  Update the countdown.
  if(this.countdown === undefined) {
    this.countdown = 1; // countdown from 3 secs
  }
  this.countdown -= dt;

  if(this.countdown < 2) { 
    this.countdownMessage = "2"; 
  }
  if(this.countdown < 1) { 
    this.countdownMessage = "1"; 
  } 
  if(this.countdown <= 0) {
    this.countdownMessage = "0"; 
    //  Move to the next level, popping this state.
    game.moveToState(new PlayState(game.config, this.level));
  }

};

function PlayState(config, level) {
  this.config = config;
  this.level = level;

  //  Game state
  this.invaderCurrentVelocity =  10;
  this.invaderCurrentDropDistance =  0;
  this.invadersAreDropping =  false;

  //  Game entities.
  this.ship = null;
  this.invaders = [];
  this.rockets = [];
  this.bombs = [];
}


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
        (game.gameBounds.top + rank * 20),
        rank, file, 'Invader'));
    }
  }
  this.invaders = invaders;
  this.invaderCurrentVelocity = this.invaderInitialVelocity;
  this.invaderVelocity = {x: -this.invaderInitialVelocity, y:0};
  this.invaderNextVelocity = null;
};

 PlayState.prototype.update = function(game, dt) {
  
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
      //game.sounds.playSound('explosion');
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

  //  Clear the background.
  ctx.clearRect(0, 0, game.width, game.height);

  //  Draw ship.
  ctx.fillStyle = '#999999';
  ctx.fillRect(this.ship.x - (this.ship.width / 2), this.ship.y - (this.ship.height / 2), this.ship.width, this.ship.height);

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
    ctx.fillRect(bomb.x - 2, bomb.y - 2, 4, 4);
  }

  //  Draw rockets.
  ctx.fillStyle = '#ff0000';
  for(var i=0; i<this.rockets.length; i++) {
    var rocket = this.rockets[i];
    //ctx.fillRect(rocket.x, rocket.y - 2, 1, 4);
    ctx.drawImage(spice_rocket, rocket.x, rocket.y - 2, 10, 30);
  }

};

function GameOverState() {

};

GameOverState.prototype.draw = function(game, dt, ctx){
  ctx.clearRect(0, 0, game.width, game.height);
  ctx.fillStyle = '#000000';
  ctx.fillText("Game Over", game.width / 2, game.height/2);
  ctx.fillText("press r to play again", game.width / 2, game.height / 1.8);
};

GameOverState.prototype.keyDown = function(game, keyCode) {
  if(keyCode == 82){
    game.moveToState(new LevelIntroState(game.level));
  }
};

