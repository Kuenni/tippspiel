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
			nCorrect: 'INT',
			nDiff: 'INT',
			nTrend: 'INT',
			bets: {
				collection: 'bet',
				via : 'userMod'
			},
			updateNumberCorrectBets : function(){
				var requestedUser = this;
				var requestUsername = this.username;
				Bet.find({user:this.username}).populateAll().exec(function(err,bets){
					var correctCounter = 0;
					bets.forEach(function(bet){
						var resultCode = bet.getBetResultCode();
						if(resultCode == 3){
							correctCounter += 1;
						}
						
					});
					requestedUser.nCorrect = correctCounter;
					requestedUser.save();
				});
			},
			updateNumberDifferenceBets : function(){
				var requestedUser = this;
				var requestUsername = this.username;
				Bet.find({user:this.username}).populateAll().exec(function(err,bets){
					var differenceCounter = 0;
					bets.forEach(function(bet){
						var resultCode = bet.getBetResultCode();
						if(resultCode == 2){
							differenceCounter += 1;
						}
					});
					requestedUser.nDiff = differenceCounter;
					requestedUser.save();
				});
			},
			updateNumberTendencyBets : function(callback){
				var requestedUser = this;
				var requestUsername = this.username;
				Bet.find({user:this.username}).populateAll().exec(function(err,bets){
				var tendencyCounter = 0;				
				bets.forEach(function(bet){
					if(bet.getBetResultCode() == 1){
						tendencyCounter += 1;
					}
				});
				requestedUser.nTrend = tendencyCounter;
				requestedUser.save();
				});

			}
		}
};

