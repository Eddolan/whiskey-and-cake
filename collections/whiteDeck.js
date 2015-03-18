// shuffled decks
WhiteDeck = new Meteor.Collection("WhiteDeck");
BlackDeck = new Meteor.Collection('BlackDeck');

// collection with all user hands
PlayerHand = new Meteor.Collection("PlayerHand");

// collection of all cards on the game table
GameBoard = new Meteor.Collection("GameBoard");

Scoreboard = new Meteor.Collection("Scoreboard");

Cheaters = new Meteor.Collection("Cheaters");


Meteor.methods({
  // function deals a player hand at the beginning of the game
  // initially took an argument 'PlayerHand'
  // Think the argument will probably need to be user_id, or something along those lines.
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
  // Also took the argument PlayerHand
  // Going to give it a go without 
  drawWhite: function() {
    for (var i = 0; i<Meteor.users().count; i++) {
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