/**
 * Created by kate on 3/12/15.
 */

// omit the var so the variable is available outside the file
BlackDeck = new Meteor.Collection('BlackDeck');

ShuffledBlackDeck = new Meteor.Collection('ShuffledBlackDeck');

//Meteor.publish('AllBlackCards', function() {
//  //return BlackDeck.find();
//  return BlackDeck.findOne({no: 2});
//});
//
//Meteor.subscribe('AllBlackCards', function() {
//
//});




//// Instantiate Shuffled Deck prior to each game
//var _countBlack = BlackDeck.find().count(); //275
//
//
//
//
//// Black Deck
//_key = newKey(_countBlack);
//for (var i=0; i<_countBlack; i++) {
//  while (ShuffledBlackDeck.findOne({no: _key})) {
//    _key = newKey(_countBlack);
//  }
//  _entry = BlackDeck.findOne({no: i});
//  ShuffledBlackDeck.insert({
//    no: _key,
//    text: _entry.text,
//    expansion: _entry.expansion
//  });
//}