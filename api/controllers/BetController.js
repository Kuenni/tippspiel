/**
 * MainController
 * 
 * @description :: Server-side logic for managing mains
 * @help :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
		loadMatchday: function(req,res){
			var query = req.query;
			Season.findOne({id:query.season}).exec(function(err,season){
				if(err) return res.send(err,500);
				LigaDbCaller.getMatches(season,query.matchday,function(error,matchdayData){
					if(error) return res.send(500,error);
					var bets = [];
					matchdayData = JSON.parse(matchdayData);
					//LigaDB may be unavailable but respond with message
					if(matchdayData.hasOwnProperty("Message")){
						return res.send(500,matchdayData);
					}
					var toProcess = matchdayData.length;
					matchdayData.forEach(function(match){
						Bet.create(
								{user:query.user,
								matchday:query.matchday,
								matchId:match.MatchID,
								season:query.season,
								teamhome: match.Team1.TeamName,
								teamguest: match.Team2.TeamName,
								logoTeam1: match.Team1.TeamIconUrl,
								logoTeam2: match.Team2.TeamIconUrl
							}).exec(function(err,createdBet){
								if(err) return res.send(500,err);
								toProcess -= 1;
								bets.push(createdBet);
								if(toProcess == 0){
									res.json(bets);
								}
							});
					});
				});
			});
		},
		index: function(req,res){
			//TODO: check whether requested user id is the login id
			if(req.query){
				Bet.find(req.query).populateAll().exec(function(err,bets){
					if(err) return res.send(500,err);
					bets.forEach(function(bet){
						bet.points = bet._points();
					});
					return res.json(bets)
				});
			} else{
			Bet.find().populate('season').exec(function(err,bets){
				if(err) return res.send(500,err);
				return res.json(bets);
			});
			}
		},
		refresh: function(req,res){
			if(req.query){
				Bet.find(req.query).populate('season').exec(function(err,bets){
					if(err) return res.send(500,err);
					bets.forEach(function(bet){
						bet.updateCachedResults();
					});
					res.json(bets);
				});
			} else {
				res.json({"message":"Not possible"});
			}
		},
		updateBets: function(req,res){
			var allBets = req.param("matches");
			var matchesLeft = allBets.length;
			var matchday = req.param("matchday");
			var username = req.session.user.username;
			var updatedBetList = [];
			allBets.forEach(function(bet){
				matchId = bet.match.id;
				if (matchId == undefined){
					matchId = bet.match;
				}
				Bet.update({user : username,
					matchday:matchday,match:matchId},
					{goalshome:bet.goalshome, goalsguest:bet.goalsguest,
						userMod:req.session.user.id}).exec(function(err,updatedBets){
							if(err){
								console.log("Error on bets update");
								res.send(500);
								return;
							}
							//Take only the first returned value.
							//The updated should anyways only work on a unique record
							localBet = updatedBets[0];
							Bet.findOneById(localBet.id).populateAll().exec(function(err,bet){
								bet.betresultcode = bet.getBetResultCode();
								bet.save(function(err,savedBet){
									if(err)
										console.log(err);
									updatedBetList.push(savedBet);
									matchesLeft -= 1;
									if(matchesLeft == 0){
										User.findOneByUsername(bet.user).populate('bets').exec(function(err,user){
											user.updateBetStatistics(function(results){
												user.nCorrect = results.nCorrect;
												user.nDiff = results.nDiff;
												user.nTrend = results.nTrend;
												user.save();
												res.send(200,updatedBetList);
											});
										});										
									}
								});

							});
						});
			});
		},
		bets : function(req,res){
			if(!req.session.authenticated){
				res.redirect('/login');
				return;
			}
			res.view();
		},
		pointsWithTime : function(req,res){
			User.find().populate('bets').exec(function(err, users){
				if(err){
					console.log('Error getting users for points timeline');
				}
				var usersLeft = users.length;
				var timelines = []
				users.forEach(function(user){
					usersLeft -= 1;
					var userTimeline = {user:user.username,timeline:[]};
					//Unary "+" means cast value to int
					user.bets.sort(function(a,b){
						return a.matchday - b.matchday;
					}).forEach(function(bet){
						//Continue if the bet cannot be completely evaluated
						if(+bet.cachedPoints === -1){
							return;
						}
						if(userTimeline.timeline.length != 0 &&
								userTimeline.timeline[userTimeline.timeline.length - 1].matchday === +bet.matchday){
							userTimeline.timeline[userTimeline.timeline.length - 1].points += +bet.cachedPoints;
						}
						else{
							userTimeline.timeline.push({matchday:+bet.matchday,points: +bet.cachedPoints});
						}
					});
					timelines.push(userTimeline);
					if(usersLeft == 0){
						res.send(200,timelines);
					}
				});
			});
		}
};
