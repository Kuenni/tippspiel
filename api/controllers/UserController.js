/**
 * TestuserController
 *
 * @description :: Server-side logic for managing testusers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

/**
 * Helper function which is used for mapping with async.
 * Each user is mapped onto this function to calculate the
 * points over the season.
 */
var addPointsForUser = function(season){
	return function(user,callback){
		var pointCounterObject 
		= {username:user.username,points:0,nCorrect : 0, nDiff : 0, nTrend: 0};
		Bet.find({user:user.id,season:season})
		.then(function(bets){
			bets.forEach(function(bet){			// For all bets for a user
				var betPoints = +bet._points();	// sum up the points
				if( isNaN(betPoints) ){			// and skip NaNs
					return;
				}
				pointCounterObject.points += betPoints;
				switch (+bet._points()) { //unary + means cast to integer
				case 5:
					pointCounterObject.nCorrect += 1;
					break;
				case 3:
					pointCounterObject.nDiff += 1;
					break;
				case 1:
					pointCounterObject.nTrend += 1;
					break;
				default:
					break;
				}
			});
			return callback(0,pointCounterObject);
		})
		.catch(function(err){
			return callback(err);
		});
	}
}

module.exports = {
		ranking : function(req,res){
			if(req.query.season){
				var userPoints = [];
				User.find().populate('bets')
				.then(function(users){
					async.map(users,addPointsForUser(req.query.season),function(err,pointList){
						if(err){
							sails.log.error("UserController - ranking: Error in mapping users and points");
							sails.log.error(err);
							return res.send(500,err);
						}
						return res.json(pointList);
					});
				})
				.catch(function(err){
					sails.log.error("UserController - ranking: Error in finding users");
					sails.log.error(err);
					return res.send(500,err);
				});

			} else{
				return res.send(400,{message:"Need a season to create the ranking for!"});
			}
		}
};

