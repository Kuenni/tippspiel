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
			Bets.findByMatchday(matchday).exec(	function(err, bets) {
				if (err) {
					console.log("Bets DB Error");
					res.send(500, {
						error : "Bets DB Error"
					});
					return;
				}
				if(bets.length == 0){
					Results.findByMatchday(matchday).exec(function(err, results) {
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
							var newBet = match;
							delete newBet.id;
							match.goalshome = -1;
							match.goalsguest = -1;
							match.user = req.session.user.username;
							match.season = SEASON;
							Bets.create(match).exec(function(err,newItem){
								if(err){
									console.log("Error on creating new Bet")
								}
								resultsLeft -= 1;
								if(resultsLeft == 0){
									Bets.findByMatchday(matchday).exec(function(err,results){
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
						});
					});
				}
				else{
					res.send(200, {bets : bets});
				}
			});
		},
		updateBets: function(req,res){
			var matches = req.param("matches");
			var matchesLeft = matches.length;
			matches.forEach(function(match){
				Bets.update({id:match.id},
						{	goalshome:match.goalshome,
							goalsguest:match.goalsguest,
							user:req.session.user.username,
							season:SEASON }).exec(function(err,updated){
							if(err){
								console.log('Error on update');
								console.log(err);
								res.send(500,{error:"Error on update"});
								return;
							} else{
								if(updated.length = 0){
									Bets.create(match);
								}
								matchesLeft -= 1;
							}
							if(matchesLeft == 0){
								res.send(200);
							}
						});
			});
		},
		bets : function(req,res){
			res.view();
		}
};
