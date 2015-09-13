/**
* Users.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
	  username: 'STRING',
	  password: 'STRING',
	  bets: {
		  collection: 'bets',
		  via : 'userMod'
	  },
	  getNumberCorrectBets : function(){
		  var correctCounter = 0;
		  this.bets.forEach(function(bet){
			  if(bet.getBetResultCode() == 3){
				  correctCounter += 1;
			  }
		  });
		  return correctCounter;
	  },
	  getNumberDifferenceBets : function(){},
	  getNumberTendencyBets : function(){}
  }
};

