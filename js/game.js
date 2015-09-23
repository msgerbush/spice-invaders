font_color = "#ffe401";

function Game() {
  // Set the initial config.
  this.config = {
    bombRate: .175,
    bombMinVelocity: 300,
    bombMaxVelocity: 300,
    invaderInitialVelocity: 40, invaderAcceleration: 6,
    invaderDropDistance: 15,
    rocketVelocity: 400,
    rocketMaxFireRate: 2,
    gameWidth: 500,
    gameHeight: 300,
    fps: 50,
    debugMode: false,
    shipSpeed: 200,
    levelDifficultyMultiplier: 0.2,
    pointsPerInvader: 5,
    pointsPerMothership: 50,
    invaderRanks: 5,
    invaderFiles: 7,
    ticketWidth: 300,
    ticketHeight: 175,
    invincibleDuration: .7,
    rumbleInterval: 0.02,
    rumbleWidth: 3,
    mothershipInterval: 2,
    wonDelay: 2.5,
    victoryTime: 5,
    soundEnabled: false
  };

  this.config.invaderWidth = this.config.ticketWidth / this.config.invaderFiles;
  this.config.invaderHeight =  this.config.ticketHeight / this.config.invaderRanks;
  this.config.initialNumOfInvaders = this.config.invaderRanks * this.config.invaderFiles;

  this.sounds = {
    explosion: 'sound/rex_collision.mp3',
    laser: 'sound/laser_blast.mp3',
    ticketBoom: 'sound/ship_explosion.mp3',
    mothership: 'sound/mothership_sound_1.mp3'
  };

  // All state is in the variables below.
  this.lives = 0;
  this.width = 0;
  this.height = 0;
  this.level = 1;
  this.score = 0;
  this.gameBound = {left: 0, topp: 0, right: 0, bottom: 0};
  this.invincibleCounter = 0;
  this.rumbleCounter = 0;
  this.rumbleOffset = 0;
  this.mothershipLeft = true;
  this.ticketId = null;

  //  The state stack.
  this.stateStack = [];

  //  Input/output
  this.pressedKeys = {};
  this.gameCanvas = null;
  this.ticketCanvas = null;
  this.ticketPending = true;
  this.mockTicket = false;
}

// constructor thingy
Game.prototype.initialise = function(gameCanvas) {
  //  Set the game canvas.
  var game = this;
  this.gameCanvas = gameCanvas;

  //  Set the game width and height.
  this.width = gameCanvas.width;
  this.height = gameCanvas.height;

  //  Set the state game bounds.
  this.gameBounds = {
    left: gameCanvas.width / 2 - this.config.gameWidth / 2,
    right: gameCanvas.width / 2 + this.config.gameWidth / 2,
    topp: gameCanvas.height / 2 - this.config.gameHeight / 2,
    bottom: gameCanvas.height / 2 + this.config.gameHeight / 1.5,
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

Game.prototype.setTicketData = function(ticket) {
  var status = ticket['status'].charAt(0).toUpperCase() +
    ticket['status'].slice(1);
  var priority = {1: 'High', 2: 'Med', 3: 'Low'}[ticket.priority];
  t = $('#ticket');
  t.find('.summary').html(ticket['summary']);
  t.find('.description').html(ticket['description']);
  t.find('.priority').html("Priority: " + priority);
  t.find('.status').html("Status: " + status);
  t.find('.ticketID').html("ID: " + ticket['id']);
  t.find('.author').html("Author: " + ticket['creator']['first_name']+' ' +ticket['creator']['last_name']);
}

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
  this.config.debugMode = /debug=true/.test(window.location.href);

  //  Start the game loop.
  var game = this;
  this.intervalId = setInterval(function () { gameLoop(game);}, 1000 / this.config.fps);
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

Game.prototype.playSound = function(sound) {
  if(this.config.soundEnabled) {
    var audio = new Audio(this.sounds[sound]);
    audio.play();
  }
}
