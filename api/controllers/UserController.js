/**
 * TestuserController
 *
 * @description :: Server-side logic for managing testusers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
		index : function(req,res){
			var userPoints = []
			User.find().populate("bets").exec(function(err,userList){
				var usersLeft = userList.length;
				userList.forEach(function(user){
					var localObject = {username:user.username,points:0,nCorrect : 0, nDiff : 0, nTrend: 0};
					req.query.user = user.id;
					Bet.find(req.query).populate("season").exec(function(err,betList){
						usersLeft -= 1;
						betList.forEach(function(bet){
							localObject.points += +bet._points();
							switch (+bet._points()) {
							case 5:
								localObject.nCorrect += 1;
								break;
							case 3:
								localObject.nDiff += 1;
								break;
							case 1:
								localObject.nTrend += 1;
								break;
							default:
								break;
							}
						});
						userPoints.push(localObject);
						if(usersLeft == 0){
							return res.json(userPoints);
							console.log(userPoints);
						}
					});
				});
			});
		}
		
};

