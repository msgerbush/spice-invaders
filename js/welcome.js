function WelcomeState() {

}

function ticketSelected(ticketRow, game){
  var ticket = $(ticketRow).data('ticket');
  game.setTicketData(ticket);
  html2canvas($('#ticket')[0], {
    onrendered: function(canvas) {
      game.ticketCanvas = canvas;
      // $('.ticket').remove();
      $('#ticket_selector_modal').modal('hide');
      game.moveToState(new LevelIntroState(game.level));
    }
  });
}

function addTicketRow(list, ticket) {
  var priority = {1: 'High', 2: 'Med', 3: 'Low'}[ticket.priority];
  var assignee = ticket.assignee;
  var assigneeName;
  if(assignee){
    assigneeName = assignee.first_name + ' ' + assignee.last_name;
  } else {
    assigneeName = "Unassigned";
  }

  $('<tr>').appendTo(list)
    .append('<td>'+ ticket.id +'</td>')
    .append('<td>'+ ticket.summary +'</td>')
    .append('<td>'+ assigneeName +'</td>')
    .append('<td>'+ priority +'</td>')
    .data('ticket', ticket);
}

function loadTickets() {
  card = new SW.Card();
  card.services('helpdesk').request('tickets', {per_page: 8})
    .then(function(data) {
      var $list = $('.ticket-list');
      data.tickets.forEach(function (ticket) {
        addTicketRow($list, ticket);
      });
      $('.ticket-loading').hide();
      $('.ticket-table').show();
  	});
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
