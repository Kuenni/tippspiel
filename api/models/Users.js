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
	  getNumberCorrectBets : function(callback){
		  var correctCounter = 0;
		  Bets.find({user:this.user.username}).populateAll().exec(function(err,bets){
			  if(err){
				  console.log("Get correct bets error");
				  console.log(err);
			  }
			  console.log("Counting correct Bets");
			  bets.forEach(function(bet){
				  if(bet.getBetResultCode() == 3){
					  correctCounter += 1;
				  }
				  console.log("count" + correctCounter);
			  });
			  console.log("Done");
			  callback(null,correctCounter);
		  });
/*		  
		  console.log("User bets");
		  console.log(this.bets);
		  this.bets.forEach(function(bet){
			  if(bet.getBetResultCode() == 3){
				  correctCounter += 1;
			  }
			  console.log(correctCounter);
		  });
		  return correctCounter;*/
	  },
	  getNumberDifferenceBets : function(){},
	  getNumberTendencyBets : function(){}
  }
};

