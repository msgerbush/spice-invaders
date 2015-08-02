
function VictoryState() {
  this.foundership = null;
};

VictoryState.prototype.enter = function(game) {
  this.foundership = new Foundership(game.width - 300 / 2 - 5, 50);
  this.foundershipLeft = true;
  this.time = 0;
  this.closed = false;
}

VictoryState.prototype.draw = function(game, dt, ctx){
  ctx.drawImage(background, 0, 0, game.width, game.height);
  ctx.font="42px Orbitron";
  ctx.textAlign = 'center';
  ctx.fillStyle = font_color;
  ctx.fillText("Score", game.width / 2, game.height/3);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(game.score, game.width / 2, game.height/3 + 40);

  ctx.font="36px Orbitron";
  ctx.fillStyle = font_color;
  ctx.fillText("Ticket Closed!", game.width / 2, game.height/3 + 100);
  ctx.font="16px Orbitron";

  ctx.drawImage(foundership_img,
                this.foundership.x - this.foundership.width / 2,
                this.foundership.y - this.foundership.height / 2,
                this.foundership.width,
                this.foundership.height);
};

VictoryState.prototype.update = function(game, dt) {
  this.time += dt;
  var fs = this.foundership;
  var dir = this.foundershipLeft ? -1 : 1;
  fs.x += dt * fs.velocity * dir;
  //  If the rocket has gone off the screen remove it.
  if(fs.x - fs.width / 2 < 0 || fs.x + fs.width / 2 > game.width) {
    this.foundershipLeft = !this.foundershipLeft;
  }

  if(!this.closed && this.time > game.config.victoryTime){
    card.services('helpdesk').request('ticket:update', game.ticketId, { status: 'closed' });
    this.closed = true;
    card.services('environment').trigger('navigate', 'tickets/v2#closed_tickets/' + game.ticketId);
  }
}
