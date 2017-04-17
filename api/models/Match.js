/**
 * Match
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
			cachedGoalsHome: {
				type: 'INT',
				defaultsTo : -1
			},
			cachedGoalsGuest: {
				type: 'INT',
				defaultsTo : -1
			},
			openDbMatchId: {
				type:'INT',
				unique: true,
				required: true
			},
			season: {
				model: 'season'
			},
			matchDateTime: 'datetime',
			isFinished: 'boolean',
			
			/*
			 * Check whether update of the match is needed.
			 * Update only, if the match finished flag is not yet set and
			 * the current time is after the the expected end of the game
			 */
			isNeedsUpdate: function() {
				var matchEndTime = new Date(this.matchDateTime);
				matchEndTime.setMinutes(matchEndTime.getMinutes() + 105); //90 minutes + half time
				
				var staleResults = (this.cachedGoalsHome == -1 || this.cachedGoalsGuest == -1);
				var afterMatchEnd = matchEndTime < new Date();
				var needsUpdate = (afterMatchEnd && staleResults);
								
				return needsUpdate;
			},
			/*
			 * Functions for match results. If necessary the cached
			 * results are updated
			 */
			goalsHome: function(){
				if(this.isNeedsUpdate()){
					this.updateResults(function(err,updatedMatch){
						if(err){
							sails.log.error("Match.js - goalsHome: Error getting goals of home team");
							sails.log.error(err);
							return -1;
						}
						return updatedMatch.cachedGoalsHome;
					});
				} else{
					return this.cachedGoalsHome;
				}
			},
			goalsGuest: function(){
				if(this.isNeedsUpdate()){
					this.updateResults(function(err,updatedMatch){
						if(err){
							sails.log.error("Match.js - goalsGuest: Error getting goals of guest team");
							sails.log.error(err);
							return -1;
						}
						return updatedMatch.cachedGoalsGuest;
					});
				} else{
					return this.cachedGoalsGuest;
				}
			},
			/*
			 * Update the cached attributes in this bet
			 */
			updateResults : function(callback){
				var localMatch = this;
				LigaDbCaller.getMatchResult(localMatch,function(err,matchResult){
					if(err){
						sails.log.error("Match.js - updateResults: Error from LigaDbCaller");
						sails.log.error(err);
						return callback(err);
					}
					matchResult.MatchResults.forEach(function(result){
						if(result.ResultTypeID == 2){ //Type id 2 = result at match end
							localMatch.cachedGoalsHome = result.PointsTeam1;
							localMatch.cachedGoalsGuest = result.PointsTeam2;
							localMatch.isFinished = matchResult.MatchIsFinished;
							
							Match.update(localMatch.id, {
								cachedGoalsHome : result.PointsTeam1,
								cachedGoalsGuest : result.PointsTeam2,
								isFinished : matchResult.MatchIsFinished
							})
							.exec(function(err,updatedMatch){
								if(err){
									sails.log.error("Match.js - updateResults: Error saving updated match result MatchID -> " + localMatch.id );
								}
								return err;
							});
						}
					});
					callback(null,localMatch);
				});
			}
		}
};