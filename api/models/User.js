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
				console.log('Username in update ' + this.username);
				var requestedUser = this;
				var requestUsername = this.username;
				Bet.find({user:this.username}).populateAll().exec(function(err,bets){
					var correctCounter = 0;
					console.log(requestedUser);
					bets.forEach(function(bet){
		//				console.log(bet);
		//				console.log('###########')
						var resultCode = bet.getBetResultCode();
						console.log(resultCode);
		//				console.log('###########')
						if(resultCode == 3){
							correctCounter += 1;
						}
						
					});
					requestedUser.nCorrect = correctCounter;
					console.log('###########');
					console.log(correctCounter);
					console.log(requestedUser.nCorrect);
					console.log(requestedUser.username);
					console.log('###########');
//					User.update({username : requestUsername},
//							{nCorrect : correctCounter}).exec(function(err,updated){
//								console.log(err);
//								console.log(updated);
//								console.log(requestUsername);
//						//		updated[0].save();
//							});
					requestedUser.save();
				});
//				
//				var correctCounter = 0;
//				this.bets.forEach(function(bet){
//					console.log(bet);
//					if(bet.getBetResultCode() == 3){
//						correctCounter += 1;
//					}
//				});
//				this.nCorrect = correctCounter;
//				this.save();
			},
			updateNumberDifferenceBets : function(){
				var requestUsername = this.username;
				Bet.find({user:this.username}).populateAll().exec(function(err,bets){

				var differenceCounter = 0;
				bets.forEach(function(bet){
					if(bet.getBetResultCode() == 2){
						differenceCounter += 1;
					}
				});
	//			this.user.nDiff = differenceCounter;
	//			this.user.save();
				});

			},
			updateNumberTendencyBets : function(callback){
				Bet.find({user:this.username}).populateAll().exec(function(err,bets){

				var tendencyCounter = 0;				
				bets.forEach(function(bet){
					if(bet.getBetResultCode() == 1){
						tendencyCounter += 1;
					}
				});
	//			this.user.nTrend = tendencyCounter;
	//			this.user.save();
				});

			}
		}
};

