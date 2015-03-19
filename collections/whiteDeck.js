// shuffled decks
WhiteDeck = new Meteor.Collection("WhiteDeck");
BlackDeck = new Meteor.Collection('BlackDeck');

// collection with all user hands
PlayerHand = new Meteor.Collection("PlayerHand");

// collection of all cards on the game table
GameBoard = new Meteor.Collection("GameBoard");


Scoreboard = new Meteor.Collection("Scoreboard");
Cheaters = new Meteor.Collection("Cheaters");

Meteor.publish('WhiteDeck', function() { return WhiteDeck.find(); });
Meteor.publish('BlackDeck', function() { return BlackDeck.find(); });
Meteor.publish('PlayerHand', function() { return PlayerHand.find(); });
Meteor.publish('GameBoard', function() { return GameBoard.find(); });
Meteor.publish('Scoreboard', function() { return Scoreboard.find(); });
Meteor.publish('Cheaters', function() { return Cheaters.find(); });

Meteor.methods({
  // function deals a player hand at the beginning of the game
  dealHand: function() {
    for (var i = 0; i < 10; i++) {
      var _entry = WhiteDeck.findOne({}, {no: 1});
      var _id = _entry.no;
      PlayerHand.insert({
        no: _entry.no,
        text: _entry.text,
        expansion: _entry.expansion,
        owner: Meteor.user().username
      });
      WhiteDeck.remove({no: _id});
    }
  },
  // replenishes white cards in the player's hand
  drawWhite: function() {
    for (var i = 0; i< 10-PlayerHand.find({}, {owner: Meteor.user().username}).count(); i++) {
      if (PlayerHand.find({}, {owner: Meteor.user().username}).count() < 10) {
        var _entry = WhiteDeck.findOne({}, {no: 1});
        var _id = _entry.no;
        PlayerHand.insert({
          no: _entry.no,
          text: _entry.text,
          expansion: _entry.expansion,
          owner: Meteor.user().username
        });
        WhiteDeck.remove({no: _id});
      }
    }
  },
  // adds card to game board with the user id and removes from playerhand
  // added username
  playCard: function(card) {
    PlayerHand.remove({no: card.no});
    GameBoard.insert({
      no: card.no,
      text: card.text,
      expansion: card.expansion,
      black: false,
      owner: card.owner
    });
  },
  // this function starts a new hand by clearing the GameBoard and adding a black card
  drawBlack: function() {
    GameBoard.remove({});
    var _card = BlackDeck.findOne({}, {no: 1});
    var _id = _card.no;
    GameBoard.insert({
      no: _card.no,
      text: _card.text,
      expansion: _card.expansion,
      owner: _card.owner,
      black: true
    });
    BlackDeck.remove({no: _id});
  }
});