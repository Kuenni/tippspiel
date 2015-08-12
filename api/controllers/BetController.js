/**
 * MainController
 * 
 * @description :: Server-side logic for managing mains
 * @help :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

		listBets : function(req, res) {
			var matchday = req.param("matchday");
			if(typeof matchday == "undefined"){
				matchday = 1
			}
			Bets.findByMatchday(matchday).exec(
					function(err, results) {
						if (err) {
							console.log("DB Error");
							res.send(500, {
								error : "DB Error"
							});
						}
						var matchesLeft = results.length;
						if(matchesLeft == 0){
							res.send(200, {bets : results});
						}
						results.forEach(function(match){
							console.log('test')
							delete match.id;
							matchesLeft -= 1;
							if(matchesLeft == 0){
								res.send(200, {bets : results});
							}
						});
					});
		},
		bets : function(req,res){
			res.view();
		},
		updateBets: function(req,res){
			var matches = req.param("matches");
			var matchesLeft = matches.length;
			matches.forEach(function(match){
				Bets.update({id:match.id},
						{goalshome:match.goalshome,goalsguest:match.goalsguest}).exec(function(err,updated){
							if(err){
								console.log('Error on update');
								console.log(err);
								res.send(500,{error:"Error on update"});
								return;
							} else{
								console.log(updated);
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
		}
};
