/**
 * MainController
 * 
 * @description :: Server-side logic for managing mains
 * @help :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
		/*
		 * render index page
		 */
		index : function(req, res) {
			res.view();
		},
		/*
		 * Try to signup a user
		 */
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
						password : password,
						nCorrect : 0,
						nDiff : 0,
						nTrend : 0
					}).exec(function(error, user) {
						if (error) {
							console.log("Error on create user");
							res.send(500, {
								error : "DB Error"
							});
						} else {
							req.session.user = user;
							req.session.authenticated = true;
							return res.redirect("/bets");
						}
					});
				}
			});
		},
		/*
		 * Logout user
		 */
		logout: function(req,res){
			req.session.user = undefined;
			req.session.authenticated = false;
			res.redirect('/');
		},
		/*
		 * Login user
		 */
		login : function(req, res) {
			if (req.method === 'GET'){
				res.view();
				return;
			}
			var username = req.param("username");
			var password = req.param("password");

			User.findByUsername(username).populateAll().exec(function(err, usr) {
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
							req.session.authenticated = true;
							req.param({user:{username:user.username,id:user.id}});
							return res.send(200);
						} else {
							console.log("wrong pw");
							res.statusCode = 400;
							res.json({
								error : "Wrong Password"
							});
						}
					} else {
						res.send(404, {
							error : "User not Found"
						});
					}
				}
			});
		},
		/*
		 * Get info on the currently logged in user
		 */
		currentUser : function(req,res){
			if (req.session.user != undefined){
				res.json({user:{username:req.session.user.username,id:req.session.user.id}});
			} else {
				res.json({message:"Not logged in!"});
			}
		},
		/*
		 * TODO: Still needed?
		 */
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
		/*
		 * TODO: Still needed?
		 */
		updateResults: function(req,res){
			var matches = req.param("matches");
			var matchesLeft = matches.length;
			matches.forEach(function(match){
				Result.update({id:match.id},
						{goalshome:match.goalshome,goalsguest:match.goalsguest}).exec(function(err,updated){
							matchesLeft -= 1;
							if(err){
								console.log('Error on update');
								console.log(err);
							}
							if(matchesLeft == 0){
								Ranking.updateUserRanking();
								Ranking.updateTeamRanking();
							}
						});
			});
			res.send(200);
		},
		/*
		 * TODO: Still needed?
		 */
		addToDatabase : function(req, res) {
			console.log("add to database");
			if (req.method === 'GET')
				return res.json({
					'status' : 'GET not allowed'
				});
			// Call to /upload via GET is error
			var file = req.file('jsonfile');
			var errorFlag = false;
			file.upload(function onUploadComplete(err, files) {
				// Files will be uploaded to .tmp/uploads
				if (err)
					return res.serverError(err);
				// IF ERROR Return and send 500 error with error
				var uploadedFile = files[0].fd;
				var matchesFile = require(files[0].fd);
				if(!matchesFile.matchdays){
					console.log('Parameter matchdays not found!');
					res.send(415,{message:'Parameter matchdays not found!'});
					return;
				}
				matchesFile.matchdays.forEach(function(match,index,array){
					if(!match.matchday){
						console.log('Parameter matchday not found!');
						errorFlag = true;
						match.matchday = -1;
					}
					Team.find({name:match.teamhome}).exec(function(err,teams){
						if (teams.length == 0){
							Team.create({name:match.teamhome,
								wins : 0,
								draws : 0,
								losses : 0,
								points : 0}).exec(function(err,newItem){
									console.log('MainController:' + 177);
									console.log(newItem);
								});
						}
					});
					Result.find({matchday:match.matchday,teamhome:match.teamhome}).exec(
							function(err, results) {
								console.log('MainController:' + 184);
								console.log(index);
								if (err) {
									console.log("DB Error in addMatchData");
									errorFlag = true;
								}
								if (results.length == 0) {
									if(!match.teamhome || !match.teamguest){
										console.log('Parameter teamhome or teamguest not found!');
										errorFlag = true;
									} else{
										Result.create({
											matchday: match.matchday,
											teamhome: match.teamhome,
											teamguest: match.teamguest,
											goalshome: -1,
											goalsguest: -1}).exec(function(){
												if(index == (array.length-1) && !errorFlag){
													res.send(200);													
												}
											});
									}
								}
								//TODO: Remove tmp file
								if(index == array.length -1 && errorFlag){
									res.send(415,{message : 'Error when processing JSON file'});
								}
							});
				});
			});//On upload complete
		}//Add to database
};
