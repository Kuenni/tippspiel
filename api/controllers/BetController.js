/**
 * MainController
 * 
 * @description :: Server-side logic for managing mains
 * @help :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

async  = require('async')

// closure function to make user id available in async call
var createNewBet = function createAddUserId(userId){
	return function createBet(match,callback){
		Bet.create({
			matchId		: match.openDbMatchId,
			matchday	: match.matchday,
			match		: match.id,
			teamhome	: match.teamhome,
			teamguest	: match.teamguest,
			season		: match.season,
			user		: userId
		}).exec(function(err, createdBet){
			if(err){
				sails.log.error("BetController - createNewBet: Error creating new bet from match.");
				sails.log.error(err);
				return callback(err,createdBet);
			}
			return callback(null,createdBet);
		});
	}
}


module.exports = {
		loadMatchday: function(req,res){
			var query = req.query;
			Season.findOne({id:query.season}).exec(function(err,season){
				if(err) return res.send(err,500);
			});
		},
		
		index: function(req,res){
			//TODO: check whether requested user id is the login id
			if(req.query){
				Bet.find(req.query).populate(['season','match']).exec(function(err,bets){
					if(err) return res.send(500,err);
					if(bets.length != 0){
						return res.json(bets);
					} else{
						if(!req.query.season || !req.query.matchday){
							return res.send(400,{message:"No bets in database for query but cannot create bets from given information"});
						}
						if(!req.session.user){
							return res.send(400,{message:"Cannot create bets without login!"});
						}
						sails.log.debug("Going to call getMatchesOfTheDay");
						Season.findOne({id:req.query.season})//Need good way of handling seasons not found
						.then(function(season){
							async.waterfall([
								function(cb){// Very ugly solution. Is there a better way? asyncify?
									LigaDbCaller.getMatchesOfTheDay(req.query.matchday,season,cb);
								},
								function createBets(matchList,callback){
									var betList = [];
									//Map every entry of match list to the create new bet function
									async.map(matchList,createNewBet(req.session.user.id),function(err,betlist){
										return callback(err,betlist);
									});					
								}
							],function(err,result){
								//result in waterfall is here the list of all
								//return values from createNewBet mapping
								res.json(result);
							});
						}).catch(function(error){
							sails.log.error("BetController - index:");
							sails.log.error(error)
							return res.send(500,error);
						});
					}
				});
			} else{
			Bet.find().populate(['season','match']).exec(function(err,bets){
				if(err) return res.send(500,err);
				return res.json(bets);
			});
			}
		},
		update: function(req,res){
			var user = req.param("user");
			if(!req.session.user){
				sails.log.info("BetController - update: user id " + user + " tried to update but did not have a session");
				req.flash("message","Need to log in first!");
				return res.redirect("/login");
			}
			if(user){
				/*
				 * Check whether user is the same as in the stored bet
				 */
				if(!user.id == req.session.user.id){
					sails.log.info('User' + req.session.user.id
							+ '(' + req.session.user.username + ') tried do update bet of user id ' + user.id);
					return res.send(400,{message:"Users can only update their own bets!"});
				}
				
				var updatedBet = req.body;
				var updatedBet = Bet.update(
						{id:updatedBet.id},
						{betHome : updatedBet.betHome,
						betGuest : updatedBet.betGuest
					})
				.then(function(bets){
					async.map(bets,
						function(bet,cb){
							return cb(0,bet._points());
						},
						function(err,points){
							return res.json(updatedBet);//TODO: Return only message with names of teams updated
						});
					return;
				})
				.catch(function(err){
					sails.log.error("BetController - update: Error when updating bet");
					sails.log.error(err);
					return res.send(500,{message:"Error when updating bet"});
				});
				return;
			} else{
				return res.send(400,{message:"You have to log in for updating bets."});
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
