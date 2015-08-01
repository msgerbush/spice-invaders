
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
