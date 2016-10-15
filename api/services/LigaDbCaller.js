var request = require('request');

module.exports = {

		/*
		 * Get a specific match for evaluation of results
		 */
		getRelevantResult : function(bet,callback){
			var urlToCheck = "http://www.openligadb.de/api/getmatchdata/" 
				+ bet.season.leagueShortcut + "/" + bet.season.leagueSeason + "/" + bet.matchday;
			request.get({
				url: urlToCheck
			}, function(error, response, body) {
				if (error) {
					sails.log.error(error);
					return callback(error);
				}
				else {
					//DB may be unavailble and respond with Message
					var response = JSON.parse(body);
					if(response.hasOwnProperty("Message")){
						return callback(body);
					}
					response.forEach(function(match){
						if(bet.matchId == match.MatchID){
							callback(0,match);
						}
					});
				}
			});
		},
		/*
		 * Get matches for a given matchday and season
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
		},
		/*
		 * Get the current matchday for the given season
		 */
		getCurrentMatchday : function(season, callback){
			request.get(
				{url : "http://www.openligadb.de/api/getcurrentgroup/" + season.leagueShortcut}
				, function(error, response, body){
					if(error){
						sails.log.error(error);
						callback(error);
					} else{
						callback(0,JSON.parse(body).GroupOrderID);
					}
				});
		}
}