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

