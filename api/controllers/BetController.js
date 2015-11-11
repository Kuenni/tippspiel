/**
 * MainController
 * 
 * @description :: Server-side logic for managing mains
 * @help :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var SEASON = "2015/2016";
module.exports = {

		listBets : function(req, res) {
			var matchday = req.param("matchday");
			if(typeof matchday == "undefined"){
				matchday = 1;
			}
			var username = req.session.user.username;
			Bet.find({matchday: matchday, user : username}).populateAll().exec(	function(err, bets) {
				if (err) {
					console.log("Bets DB Error");
					res.send(500, {
						error : "Bets DB Error"
					});
					return;
				}
				if(bets.length == 0){
					Result.findByMatchday(matchday).exec(function(err, results) {
						if (err) {
							console.log("Results DB Error");
							res.send(500, {
								error : "Results DB Error"
							});
							return;
						}
						if (results.length == 0) {
							res.send(500, {
								error : "DB Empty"
							});
							return;
						}
						var resultsLeft = results.length;
						results.forEach(function(match){
							var newBet = {
									user: username,
									matchday: match.matchday,
									teamhome: match.teamhome,
									teamguest:match.teamguest,
									goalshome: -1,
									goalsguest: -1,
									season: SEASON,
									match : match.id,
									userMod : req.session.user.id
							};
							Bet.create(newBet).exec(function(err,newItem){
								if(err){
									console.log("Error on creating new Bet")
								}
								resultsLeft -= 1;
								if(resultsLeft == 0){
									Bet.findByMatchday(matchday).exec(function(err,results){
										if (err) {
											console.log("Results DB Error");
											res.send(500, {
												error : "Results DB Error"
											});
											return;
										}else {
											res.send(200, {bets : results});
											return;
										}
									});
								}
							});
						});//results forEach
					});
				}// bets found != 0
				else{
					res.send(200, {bets : bets});
				}
			});
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
			User.findByUsername(req.session.user.username).populateAll().exec(function(err,users){
				res.view({test: users[0].nCorrect});
			});
		}
};
