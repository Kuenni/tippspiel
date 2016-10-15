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
			cachedGoalsHome: {
				type: 'INT',
				defaultsTo : -1
			},
			cachedGoalsGuest: {
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
			matchId: 'INT',
			user: {
				model: 'user'
			},
			season: {
				model: 'season'
			},
			/*
			 * Return cached attribute
			 */
			_points: function(){
				if(this.isNeedsUpdate()){
					this.updateCachedResults();
				}
				//Ensure no -1 values
				return this.cachedPoints > 0 ? this.cachedPoints : 0;
			},
			/*
			 * Check whether update of the cached attributes is needed
			 */
			isNeedsUpdate: function() {
				return this.cachedPoints == -1 || this.cachedGoalsHome == -1 || this.cachedGoalsGuest == -1;
			},
			/*
			 * Update the cached attributes in this bet
			 */
			updateCachedResults : function(){
				var localBet = this;
				LigaDbCaller.getRelevantResult(localBet,function(err,game){
					if(err) return -1;
					var endResult;
					game.MatchResults.forEach(function(result){
						if(result.ResultOrderID == 2){
							endResult = result;
						}
					});
					if(!endResult){
						return -1;
					}
					localBet.cachedGoalsHome = endResult.PointsTeam1;
					localBet.cachedGoalsGuest = endResult.PointsTeam2;
					if (localBet.cachedGoalsGuest == -1 || localBet.cachedGoalsHome == -1 ||
							localBet.betGuest == -1 || localBet.betHome == -1 ){
						return -1;
					}
					var deltaGoalsResult = localBet.cachedGoalsHome - localBet.cachedGoalsGuest;
					var deltaGoalsBet = localBet.betHome - localBet.betGuest;
					//Correct bet
					if(localBet.cachedGoalsHome == localBet.betHome && localBet.cachedGoalsGuest == localBet.betGuest){
						localBet.cachedPoints = 5;
					}
					//Correct difference
					else if (deltaGoalsResult == deltaGoalsBet){
						localBet.cachedPoints = 3;
					}
					//Correct tendency
					else if(sign(deltaGoalsResult) == sign(deltaGoalsBet)){
						localBet.cachedPoints = 1;
					} else {
						localBet.cachedPoints = 0;
					}
					localBet.save();
				});
			}
		}
};
