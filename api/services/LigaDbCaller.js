var request = require('request');

module.exports = {

		/*
		 * Get a specific match for evaluation of results
		 */
		getRelevantResult : function(bet,callback){
			console.log(bet);
			request.get({
				url: "http://www.openligadb.de/api/getmatchdata/" + bet.season.leagueShortcut + "/" + bet.season.leagueSeason + "/" + bet.matchday
			}, function(error, response, body) {
				if (error) {
					sails.log.error(error);
					callback(error);
				}
				else {
					JSON.parse(body).forEach(function(match){
						if(bet.matchId == match.MatchID){
							callback(0,match);
						}
					});
				}
			});
		},
		/*
		 * Get meatches for a given matchday and season
		 */
		getMatches : function(season, matchday, callback){
			request.get({
				url: "http://www.openligadb.de/api/getmatchdata/" + season.leagueShortcut + "/" + season.leagueSeason + "/" + matchday
			}, function(error, response, body) {
				if (error) {
					sails.log.error(error);
					callback(error)
				}
				else {
					callback(0,body);
				}
			});
		}
}