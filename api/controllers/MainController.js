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
			if (req.method === 'GET'){
				res.view();
				return;
			}
			var username = req.param("username");
			var password = req.param("password");
			User.findByUsername(username).exec(function(err, usr) {
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
					User.create({
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

			User.findByUsername(username).exec(function(err, usr) {
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
		getUser : function(req,res){
			if (req.session.user){
				res.json({username:user.username});
			}
		},
		createUserRanking:function(req,res){
			User.find().exec(function(err,users){
				var rankings = [];
				if(err){
					// TODO
				}
				users.forEach(function(user){
					rankings.push({
						user:user.username,
						correct: user.nCorrect,
						difference : user.nDiff,
						tendency: user.nTrend
					});				
				});
				res.send({userRankings:rankings});
			});
		},
		results : function(req, res) {
			var matchday = req.param("matchday");
			if(typeof matchday == "undefined"){
				matchday = 1
			}
			Result.findByMatchday(matchday).exec(
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
			Result.findByMatchday(req.param("matchday")).exec(
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
				Result.update({id:match.id},
						{goalshome:match.goalshome,goalsguest:match.goalsguest}).exec(function(err,updated){
							if(err){
								console.log('Error on update');
								console.log(err);
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
				if(!matchesFile.matchdays){
					console.log('Parameter matchdays not found!');
					res.send(415,{error:'Parameter matchdays not found!'});
					return;
				}
				matchesFile.matchdays.forEach(function(match,index,array){
					console.log(match.matchday);
					if(!match.matchday){
						console.log('Parameter matchday not found!');
						return;
					}
					Result.find({matchday:match.matchday,teamhome:match.teamhome}).exec(
							function(err, results) {
								console.log(results);
								if (err) {
									console.log("DB Error in addMatchData");
								}
								if (results.length == 0) {
									console.log("No data found for matchday " + match.matchday);
									if(!match.teamhome || !match.teamguest){
										console.log('Parameter teamhome of teamguest not found!');
										return;
									}
									Result.create({
										matchday: match.matchday,
										teamhome: match.teamhome,
										teamguest: match.teamguest,
										goalshome: match.goalshome,
										goalsguest: match.goalsguest}).exec(console.log);
								}
							});
				});
				//TODO: Remove tmp file
				res.json({
					status : 200,
					file : files
				});
			});//On upload complete
		}//Add to database
};
