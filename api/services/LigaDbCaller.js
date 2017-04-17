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
					//DB may be unavailable and respond with Message
				//	console.log(response);
				//	console.log(body);
					try {
						var response = JSON.parse(body);
					} catch (e) {
						return callback({message:'JSON parse error in LigaDbCaller'});
					}
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
			var url = "http://www.openligadb.de/api/getmatchdata/" + season.leagueShortcut + "/" + season.leagueSeason + "/" + matchday;
			sails.log.info("LigaDbCaller - getMatches: Call to external liga DB -> " + url);
			sails.log.info("Getting matches from url:");
			sails.log.info(url);
			request.get({
				url: url,
				header: {Accept:"application/json"}
			}, function(error, response, body) {
				if (error) {
					sails.log.error(error);
					callback(error)
				}
				else {
					callback(0,JSON.parse(body));
				}
			});
		},
		/*
		 * Get the current matchday for the given season
		 */
		getCurrentMatchday : function(season, callback){
			var url = "http://www.openligadb.de/api/getcurrentgroup/" + season.leagueShortcut;
			sails.log.info("LigaDbCaller - getCurrentMatchday: Call to external liga DB -> " + url);
			request.get(
				{url : url}
				, function(error, response, body){
					if(error){
						sails.log.error(error);
						callback(error);
					} else{
						callback(0,JSON.parse(body).GroupOrderID);
					}
				});
		},
		/*
		 * For a given matchday and season search for matches in the match database
		 * If there are no entries in the local DB yet, get the matches from the 
		 * openLigaDB and store new entries locally
		 */
		getMatchesOfTheDay : function getMatchesOfDay(matchday, season,callback){
			var matchday = matchday;
			var sesason = season;
			sails.log.info("Getting matches of the day");
			Match.find({matchday:matchday,season:season.id}).populateAll().exec(
					function(err,matches){
						if(err){
							sails.log.error("Error finding matches for the match day");
							sails.log.error(err);
							return callback(err,null);
						}
						/*
						 * No Matches found in match database
						 */
						if(matches.length == 0){
							sails.log.info("No matches in database yet");
								// Get Match data from online DB
								LigaDbCaller.getMatches(season, matchday, function(err, dbMatches){
									if(err){
										sails.log.error("Error getting matches from the Liga DB");
										sails.log.error(err);
										return callback(err,null);
									}
									var matchesToProcess = dbMatches.length;
									var matchReturnList = [];
									// Create a new Match entry for each match from online DB
									dbMatches.forEach(function(match){
										Match.create({
											matchday		: matchday,
											openDbMatchId	: match.MatchID,
											season			: season,
											teamhome		: match.Team1.TeamName,
											teamguest		: match.Team2.TeamName,
											logoTeam1		: match.Team1.TeamIconUrl,
											logoTeam2		: match.Team2.TeamIconUrl,
											matchDateTime	: match.MatchDateTime,
											isFinished		: match.MatchIsFinished
										}).exec(function(err,createdMatch){
											if(err){
												sails.log.error("Error on creating new match");
												sails.log.error(err);
												return callback(err,null);
											}
											matchesToProcess -= 1;
											matchReturnList.push(createdMatch);
											if(matchesToProcess == 0){
												return callback(err,matchReturnList);
											}
										});
									});
								});
						}//if matches length == 0
						else{// If there are already matches available, just send them
							return callback(err,matches);
						}
					}
			);
		}
}