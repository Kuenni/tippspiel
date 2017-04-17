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
					sails.log.error("DB Error on signup");
					sails.log.error(err)
					res.send(500, {
						error : err,
						message: "DB Error"
					});
				} else if (usr.length) {
					console.log("Username taken");
					res.statusCode = 400;
					res.json({
						error : "Nutzername schon vergeben"
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
							return res.redirect("/");
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
								error : "Nutzername oder Passwort falsch"
							});
						}
					} else {
						res.send(400, {
							error : "Nutzername oder Passwort falsch"
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
		currentMatchday : function(req,res){
			var season = req.param('season');
			if(!season){
				res.json({currentMatchday : 0});
			}
			Season.findOne({id:season}).exec(function(err,seasonRecord){
				if(err) return res.send(500);
				LigaDbCaller.getCurrentMatchday(seasonRecord,function(err, currentMatchday){
					if(err){
						return res.send(500);
					}
					res.json({currentMatchday:currentMatchday});
				});
			});
		}
};
