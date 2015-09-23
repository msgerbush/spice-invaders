function WelcomeState() {

}

function ticketSelected(ticketRow, game){
  var ticket = $(ticketRow).data('ticket');
  game.setTicketData(ticket);
  html2canvas($('#ticket')[0], {
    onrendered: function(canvas) {
      game.ticketCanvas = canvas;
      $('.ticket').remove();
      $('#ticket_selector_modal').modal('hide');
      game.moveToState(new LevelIntroState(game.level));
    }
  });
}

function addTicketRow(list, ticket) {
  // Add row to list for a ticket object
  $('<tr class="ticket-option">').appendTo(list)
    .append('<td colspan=4>Make Me Real Tickets!!!</td>')
  // Leave this to store object for later using jQuery Data
    .data('ticket', ticket);
}

function loadTickets() {
  var $list = $('.ticket-list');
  var fakeTicket = {
    id: 123,
    summary: 'Fake!',
    description: 'yada yada yada',
    priority: 2,
    status: 'open',
    creator: {
      first_name: 'Art',
      last_name: 'Vandalay'
    }
  }
  // First: get real tickets from SW API
  // Artificial delay, so you can see how it works...
  setTimeout(function(){
    // Add tickets as table rows
    addTicketRow($list, fakeTicket);

    // Hide loading state
    $('.ticket-loading').hide();

    // Show table
    $('.ticket-table').show();
  },3000);

}

WelcomeState.prototype.enter = function(game) {
  $('#ticket_selector_modal').modal({backdrop: 'static', show: true});
  loadTickets();
  $('#ticket_selector_modal').one('click', 'tr', function () {
    ticketSelected(this, game);
  })
}

WelcomeState.prototype.draw = function(game, dt, ctx) {
  ctx.drawImage(background, 0, 0, game.width, game.height);

  ctx.font="30px Orbitron";
  ctx.fillStyle = font_color;
  ctx.textBaseline="center";
  ctx.textAlign="center";
  ctx.fillText("Spice Invaders", game.width / 2, game.height/2 - 40);
  ctx.font="16px Orbitron";

  if(game.ticketPending) {
    ctx.font="20px Orbitron";
    ctx.fillText("Loading ticket data...", game.width / 2, game.height/2 + 30);
  }
};
