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
				var correctCounter = 0;
				this.bets.forEach(function(bet){
					if(bet.getBetResultCode() == 3){
						correctCounter += 1;
					}
				});
				this.nCorrect = correctCounter;
				this.save();
				var correctCounter = 0;
			},
			updateNumberDifferenceBets : function(){
				var differenceCounter = 0;
				
				this.bets.forEach(function(bet){
					if(bet.getBetResultCode() == 2){
						differenceCounter += 1;
					}
				});
				this.nDiff = differenceCounter;
				this.save();
			},
			updateNumberTendencyBets : function(callback){
				var tendencyCounter = 0;				
				this.bets.forEach(function(bet){
					if(bet.getBetResultCode() == 1){
						tendencyCounter += 1;
					}
				});
				this.nTrend = tendencyCounter;
				this.save();

			}
		}
};

