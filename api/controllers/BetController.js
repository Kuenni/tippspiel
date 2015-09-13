/**
 * MainController
 * 
 * @description :: Server-side logic for managing mains
 * @help :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var SEASON = "2015/2016";
var async = require("async");
module.exports = {

		listBets : function(req, res) {
			var matchday = req.param("matchday");
			if(typeof matchday == "undefined"){
				matchday = 1;
			}
			Bets.findByMatchday(matchday).populateAll().exec(	function(err, bets) {
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
							var newBet = {
									user: req.session.user.username,
									matchday: match.matchday,
									teamhome: match.teamhome,
									teamguest:match.teamguest,
									goalshome: -1,
									goalsguest: -1,
									season: SEASON,
									match : match.id,
									userMod : req.session.user.id
							};
							Bets.create(newBet).exec(function(err,newItem){
								if(err){
									console.log("Error on creating new Bet")
								}
								Bets.find().populateAll();
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
						});//results forEach
					});
				}// bets found != 0
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
							goalsguest:match.goalsguest
							}).exec(function(err,updated){
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
			Users.findByUsername(req.session.user.username).populateAll().exec(function(err,users){
				async.parallel({
					correct: users[0].getNumberCorrectBets
				},function(err,results){
					console.log("async result");
					console.log(results);
					res.view({test: results.correct});
				});
			});
		}
};
