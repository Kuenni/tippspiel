/**
 * MainController
 * 
 * @description :: Server-side logic for managing mains
 * @help :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	index : function(req, res) {
		res.view();
	},
	signup : function(req, res) {
		var username = req.param("username");
		var password = req.param("password");
		Users.findByUsername(username).exec(function(err, usr) {
			if (err) {
				console.log("DB Error on signup");
				res.send(500, {
					error : "DB Error"
				});
			} else if (usr.length) {
				console.log("Username taken");
				res.send(400, {
					error : "Username already Taken"
				});
			} else {
				var hasher = require("password-hash");
				password = hasher.generate(password);
				Users.create({
					username : username,
					password : password
				}).exec(function(error, user) {
					if (error) {
						res.send(500, {
							error : "DB Error"
						});
					} else {
						req.session.user = user;
						return res.redirect("bet/bets");
					}
				});
			}
		});
	},
	login : function(req, res) {
		var username = req.param("username");
		var password = req.param("password");

		Users.findByUsername(username).exec(function(err, usr) {
			if (err) {
				console.log("DB Error");
				res.send(500, {
					error : "DB Error"
				});
			} else {
				if (usr.length) {
					user = usr[0]
					var hasher = require("password-hash");
					if (hasher.verify(password, user.password)) {
						req.session.user = user;
						return res.redirect("bet/bets");
					} else {
						console.log("wrong pw");
						res.statusCode = 400;
						res.json({
							error : "Wrong Password"
						});
					}
				} else {
					console.log("user unknown");
					res.send(404, {
						error : "User not Found"
					});
				}
			}
		});
	},
	createUserRanking:function(req,res){
		Users.find().exec(function(err,foundList){
			var rankings = [];
			if(err){
				//TODO
			}
			var namesLeft = foundList.length;
			foundList.forEach(function(name){
				namesLeft -= 1;
				name = name.username;
				var ranking = {username : name,
					correct : 0,
					difference : 0,
					tenedency : 0
				};
				Bets.findByUser(name).where({
					goalshome	: {'>':-1},
					goalsguest 	: {'>':-1}
				}).exec(function(err,betList){
					if(err){
						//TODO
						console.log(err);
					}
					var betsLeft = betList.length;
					betList.forEach(function(bet){
						betsLeft -= 1;
						Results.findByMatchday(bet.matchday).where({
							teamhome:bet.teamhome,
							goalshome: {'>':'-1'},
							goalsguest: {'>':'-1'}
							}).exec(function(err,resultList){
							var resultsLeft = resultList.length;
							console.log(resultList);
							resultList.forEach(function(result){
								resultsLeft -= 1;
								console.log(resultsLeft);
								console.log(result)
								var deltaGoalsResult = result.goalshome - result.goalsguest;
								var deltaGoalsBet = bet.goalshome - bet.goalsguest;
								if(result.goalshome == bet.goalshome && result.goalsguest == bet.goalsguest){
									ranking.correct += 1;
								} else if (deltaGoalsResult == deltaGoalsBet){
									ranking.difference += 1;
								} else if(Math.sign(deltaGoalsResult) == Math.sign(deltaGoalsBet)){
									ranking.tendency += 1;
								}
								if(!betsLeft && !resultsLeft){
									rankings.push(ranking);
								}
								if(!namesLeft && !betsLeft && !resultsLeft){
									res.send(rankings);
								}
							});
						});
					});
				});
			});
		});
	},
	results : function(req, res) {
		var matchday = req.param("matchday");
		if(typeof matchday == "undefined"){
			matchday = 1
		}
		Results.findByMatchday(matchday).exec(
				function(err, results) {
					if (err) {
						console.log("DB Error");
						res.send(500, {
							error : "DB Error"
						});
						return;
					}
					if (results.length == 0) {
						res.send(500, {
							error : "DB Empty"
						});
						return;
					}
					res.view({matches : results})
				});

	},
	listMatchday : function(req, res) {
		Results.findByMatchday(req.param("matchday")).exec(
				function(err, results) {
					if (err) {
						console.log("DB Error");
						res.send(500, {
							error : "DB Error"
						});
						return;
					}
					if (results.length == 0) {
						res.send(500, {
							error : "DB Empty"
						});
						return;
					}
					res.send(200, {matches : results});
				});
	},
	updateResults: function(req,res){
		var matches = req.param("matches");
		matches.forEach(function(match){
			Results.update({id:match.id},
					{goalshome:match.goalshome,goalsguest:match.goalsguest}).exec(function(err,updated){
						if(err){
							console.log('Error on update');
							console.log(err);
						} else{
							console.log(updated);
						}
					});
		});
		res.send(200);
	},
	addToDatabase : function(req, res) {
		console.log("add to database");
		if (req.method === 'GET')
			return res.json({
				'status' : 'GET not allowed'
			});
		// Call to /upload via GET is error
		var file = req.file('jsonfile');

		file.upload(function onUploadComplete(err, files) {
			// Files will be uploaded to .tmp/uploads
			if (err)
				return res.serverError(err);
			// IF ERROR Return and send 500 error with error

			console.log(files[0]);
			var uploadedFile = files[0].fd;
			console.log(uploadedFile);

			var matchesFile = require(files[0].fd);
//			for (var i = 0; i < matchesFile.matchdays.length; i++) {
			matchesFile.matchdays.forEach(function(match,index,array){
//				match = matchesFile.matchdays[i];
				console.log(match.matchday);
				Results.find({matchday:match.matchday}).exec(
						function(err, results) {
							console.log(results);
							if (err) {
								console.log("DB Error in addMatchData");
							}
							if (results.length == 0) {
								console.log("No data found for matchday");
								 Results.create({
								 matchday: match.matchday,
								 teamhome: match.teamhome,
								 teamguest: match.teamguest,
								 goalshome: match.goalshome,
								 goalsguest: match.goalsguest}).exec(console.log);
							}
							var foundMatch = false;
							results.forEach(function(result,index2,array2){
						//	for (var j = 0; j < results.length; j++) {
						//		result = results[j];
						//		console.log(result);
								if (result.teamhome == match.teamhome) {
									foundMatch = true;
								}
							});
							//Das geht nicht. Durch async ist dieser Teil dran, bevor das Array
							//durchlaufen wird
							if (!foundMatch) {
								console.log("TEst");
//								Results.create({
//									matchday : match.matchday,
//									teamhome : match.teamhome,
//									teamguest : match.teamguest,
//									goalshome : match.goalshome,
//									goalsguest : match.goalsguest
//								}).exec(console.log);
							}
						});
			});
			res.json({
				status : 200,
				file : files
			});
		});
	}
};
