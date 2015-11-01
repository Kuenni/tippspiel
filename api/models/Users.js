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
				collection: 'bets',
				via : 'userMod'
			},
			getNumberCorrectBets : function(callback){
				var correctCounter = 0;
				Bets.find({user:this.username}).populateAll().exec(function(err,bets){
					if(err){
						console.log("Get correct bets error");
						console.log(err);
					}
					bets.forEach(function(bet){
						if(bet.getBetResultCode() == 3){
							correctCounter += 1;
						}
					});
					callback(null,correctCounter);
				});
			},
			getNumberDifferenceBets : function(callback){
				var differenceCounter = 0;
				Bets.find({user:this.username}).populateAll().exec(function(err,bets){
					if(err){
						console.log("Get difference bets error");
						console.log(err);
					}
					bets.forEach(function(bet){
						if(bet.getBetResultCode() == 2){
							differenceCounter += 1;
						}
					});
					callback(null,differenceCounter);
				});
			},
			getNumberTendencyBets : function(callback){
				var tendencyCounter = 0;
				Bets.find({user:this.username}).populateAll().exec(function(err,bets){
					if(err){
						console.log("Get difference bets error");
						console.log(err);
					}
					bets.forEach(function(bet){
						if(bet.getBetResultCode() == 1){
							tendencyCounter += 1;
						}
					});
					callback(null,tendencyCounter);
				});
			}
		}
};

