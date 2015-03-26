// create shuffled decks
Room = new Meteor.Collection('Room');

// create collection with all user hands
PlayerHand = new Meteor.Collection("PlayerHand");

// create collection of all cards on the game table (one black card & all played white cards)
GameBoard = new Meteor.Collection("GameBoard");

// Currently this collection provides a check for whether the round is over
// This is done by initializing a roundOver property of this collection when the judge picks a winner
// Then that property is deleted when a new round is started
RoundInfo = new Meteor.Collection("RoundInfo");

//This is where we hold our methods that get called from the client side
Meteor.methods({
  // function deals a player hand at the beginning of the game
  dealHand: function(roomId) {
    //userArray holds an array of players that are logged in using the user-status package
    //var userArray = Room.find({ _id : roomId }, { users: 1 }).fetch();
    var userArray = Room.find({ _id : roomId }, { users: 1 });
    var judgeCounter = 0;
    for (var i = 0; i < userArray.length; i++) {
      if (userArray[i].judge === true) {
        judgeCounter++;
      }
    }
    //if the deal button was pushed and no judges are assigned already, assign one randomly
    if (judgeCounter === 0) {
      var rng = Math.round(Math.random() * (userArray.length - 1));
      var randomUserId = userArray[rng]._id;
      Room.update( {_id: roomId, "users._id": randomUserId}, {$set : {'users.$.judge' : true}});
      //GameBoard.update({_id: gameId}, {$set: {'judge': true}});
    }
    //if the deal button was pushed and there is 1 judge already, toggle that judge
    if (judgeCounter === 1) {
      Meteor.call("toggleJudge", function (err) { //function at the end of this file
        if (err) {
          throw err;
        }
      });
    }
    //iterate over all active players and insert up to 10 cards in their hand
    for (var j = 0; j < userArray.length; j++) {
      //adding .fetch() onto the end of the find method returns an array, thus we can use length
      if (!(Room.find({_id: roomId, 'users._id':randomUserId[j]}, {'users.cards':1}).length === 10)) {//PlayerHand
        for (var i = 0; i < 10; i++) {
          var _entry = Room.update({_id: roomId}, {$pop: {WhiteDeck:1}}).fetch();
          Room.update({_id: roomId, 'users._id':randomUserId[j]}, {$push: {'users.cards': _entry}});
        }
      }
    }
  },

  // replenishes white cards in the player's hand
  drawWhite: function(roomId) {
    var userArray = Room.find({ _id : roomId }, { users: 1 });
    for (var i = 0; i < userArray.length; i++) {
      while (Room.find({_id: roomId, 'users._id':userArray[i]._id}, {'users.cards':1}).length < 10) {
        var _entry = Room.update({_id: roomId}, {$pop: {WhiteDeck:1}}).fetch();
        Room.update({_id: roomId, 'users._id':userArray[i]._id}, {$push: {'users.cards': _entry}});
      }
    }
  },
  // adds card to game board with the user id and removes from playerhand
  playCard: function(card, roomId) {
    Room.update({_id: roomId, 'users._id':userArray[i]._id}, {pull: {'users.cards': card.text}});
    Room.update({_id: roomId}, {GameBoard : {
        no: card.no,
        text: card.text,
        expansion: card.expansion,
        black: false,
        owner: card.owner
      }}
    );
  },

  // this function starts a new hand by clearing the GameBoard and adding a black card
  drawBlack: function(roomId) {
    Room.update({_id: roomId}, {$set: { 'GameBoard': []}});
    var _entry = Room.update({_id: roomId}, {$pop: {BlackDeck:1}}).fetch();
    Room.update({_id: roomId}, {$push: {'GameBoard': _entry}});
  },

  //increment score of card owner
  incrementScore: function(cardOwner) {
    Room.update( {_id: roomId, "users._id": cardOwner}, {$inc : {'users.$.score' : 1}});
    Meteor.users.update({_id: cardOwner}, {$inc: {'score': 1}});
  },

  // signals the end of the inserting a roundOver property and setting it to true
  endRound: function(){
    Room.update( {_id: roomId }, { $set : {'RoundInfo.roundOver': true}})
  },

  // resets the round by removing the roundOver property
  newRound: function(){
    var round = Room.update({_id: roomId}, {$pop: {RoundInfo:1}}).fetch();
    //var round = RoundInfo.findOne({});
    //RoundInfo.remove({_id: round._id});
  },

  // Clear losing cards from the gameboard by clearing the entire board
  // and then inserting the winning answer and corresponding question
  clearLosers: function(winnerCard, questionCard){

    Room.update({_id: roomId}, {$set: { 'GameBoard': []}});
    Room.update({_id: roomId}, {$push: { 'GameBoard': winnerCard}});
    Room.update({_id: roomId}, {$push: { 'GameBoard': questionCard}});

  },

  // clears gameboard & starts new round
  clearGameBoard: function() {
    Room.update({_id: roomId}, {$set: { 'GameBoard': []}});
  },

  // rotates judge role after each round
  toggleJudge: function() {
    var userArray = Room.find({ _id : roomId }, { users: 1 });
    //iterate through all active users
    for (var i = 0; i < userArray.length; i++) {
      //if that user is the judge
      if (userArray[i].judge === true) {
        //take his unique _.id
        var currentId = userArray[i]._id;
        //set his judge property to false
        Room.update( {_id: roomId, "users._id": userArray[i]._id}, {$set : {'users.$.judge' : true}});
        //if that user is the final element in the array
        if (i === (userArray.length - 1)) {
          //set the judge property to true for the first position in the array
          Room.update( {_id: roomId, "users._id": userArray[i]._id}, {$set : {'users.$.judge' : true}});
          //break out
          return;
        } else {
          //for any other position make the next array index the judge
          Room.update( {_id: roomId, "users._id": userArray[i]._id}, {$set : {'users.$.judge' : true}});
          //breakout
          return;
        }
      }
    }
  }
});
