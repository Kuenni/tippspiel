/**
 * Bets.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

function sign(x){
	if( +x === x ) { // check if a number was given
		return (x === 0) ? x : (x > 0) ? 1 : -1;
	}
	return NaN;
}

function calculateBetPoints(bet, match){
	if(match == 0){
		//Something went wrong finding a match in DB
		return -1;
	}
	var resultHome 	= match.goalsHome();
	var resultGuest = match.goalsGuest();
	var betHome 	= bet.betHome;
	var betGuest 	= bet.betGuest;
		
	if (betHome == -1 || betGuest == -1 ||
			resultHome == -1 || resultGuest == -1 ){
		return -1;
	}
	
	var deltaGoalsResult = resultHome - resultGuest;
	var deltaGoalsBet = betHome - betGuest;

	//Correct bet
	if(resultHome == betHome && resultGuest == betGuest){
		return 5;
	}
	//Correct difference
	else if (deltaGoalsResult == deltaGoalsBet){
		return 3;
	}
	//Correct tendency
	else if(sign(deltaGoalsResult) == sign(deltaGoalsBet)){
		return 1;
	}
	return 0;
}


module.exports = {

		attributes: {
			matchday: 'INT',
			teamhome: 'STRING',
			teamguest:'STRING',
			logoTeamHome: 'STRING',
			logoTeamGuest: 'STRING',
			leagueSeason: 'STRING',
			cachedPoints: {
				type: 'INT',
				defaultsTo : -1
			},
			betHome: {
				type: 'INT',
				defaultsTo: -1
			},
			betGuest: {
				type : 'INT',
				defaultsTo: -1
			},
			matchId: { 
				type: 'INT',
				required: true
			},
			user: {
				model: 'user',
				required: true
			},
			season: {
				model: 'season',
				required: true
			},
			match: {
				model:'match',
				required: true
			},
			/*
			 * Return cached attribute
			 */
			_points : function(){
				if(this.isNeedsUpdate()){
					var localBet = this;
						Match.findOne(this.match).populate('season').exec(function(err,match){
						if(err){
							sails.log.error("Bet.js - _points: Error finding match for bet point calculation BetID -> " + localBet.id);
							sails.log.error(err);
							return 0;
						}	
						localBet.cachedPoints = calculateBetPoints(localBet,match);
						if(localBet.cachedPoints != -1){
							localBet.save(function(err){
								if(err){
									sails.log.error("Bet.js - _points: Error saving cached points");
									sails.log.error(err);
								}
								return null;
							});
						}
						return localBet.cachedPoints > 0 ? localBet.cachedPoints : 0;
					});
				} else{
					//Ensure no -1 values
					return this.cachedPoints > 0 ? this.cachedPoints : 0;
				}
			},
			/*
			 * Check whether update of the cached attributes is needed
			 */
			isNeedsUpdate: function() {
				return this.cachedPoints == -1;
			}
		}
};
