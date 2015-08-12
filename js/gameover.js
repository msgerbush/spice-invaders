
function GameOverState() {

};

GameOverState.prototype.draw = function(game, dt, ctx) {
  ctx.drawImage(background, 0, 0, game.width, game.height);
  ctx.font="42px Orbitron";
  ctx.textAlign = 'center';
  ctx.fillStyle = font_color;
  ctx.fillText("Score", game.width / 2, game.height/4);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(game.score, game.width / 2, game.height/4 + 50);

  ctx.font="36px Orbitron";
  ctx.fillStyle = font_color;
  ctx.fillText("Game Over", game.width / 2, game.height/2);
  ctx.font="16px Orbitron";
  ctx.fillText("Press 'r' to play again.", game.width / 2, game.height / 1.8);
};

GameOverState.prototype.keyDown = function(game, keyCode) {
  if(keyCode == 82) {
    game.moveToState(new LevelIntroState(game.level));
  }
};
