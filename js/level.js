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
  game.lives = 3;
}

LevelIntroState.prototype.draw = function(game, dt, ctx) {
  ctx.drawImage(background, 0, 0, game.width, game.height);

  ctx.font="36px Orbitron";
  ctx.fillStyle = font_color;
  ctx.textBaseline="middle";
  ctx.textAlign="center";
  ctx.fillText("Level " + this.level, game.width / 2, game.height/2);
  ctx.font="24px Orbitron";
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

