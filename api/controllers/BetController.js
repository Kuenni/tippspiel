/**
 * MainController
 * 
 * @description :: Server-side logic for managing mains
 * @help :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var SEASON = "2015/2016";
module.exports = {
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
					user.bets.forEach(function(bet){
						//Continue if the bet cannot be completely evaluated
						if(+bet.betresultcode === -1){
							return;
						}
						if(userTimeline.timeline.length != 0 &&
								userTimeline.timeline[userTimeline.timeline.length - 1].matchday === +bet.matchday){
							userTimeline.timeline[userTimeline.timeline.length - 1].points += +bet.betresultcode;
						}
						else{
							userTimeline.timeline.push({matchday:+bet.matchday,points: +bet.betresultcode});
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
