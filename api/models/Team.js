/**
 * Team.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

		attributes: {
			name : {
				type:"String",
				unique:true
			},
			wins : 'INT',
			draws : 'INT',
			losses : 'INT',
			points : 'INT',
			getTeamStatistics : function(callback){
				var nWin = 0;
				var nDraw = 0;
				var nLoss = 0;
				Result.find({teamhome:this.name}).exec(function(err,results){
					var homeTeamResultsLeft = results.length;
					results.forEach(function(result){
						homeTeamResultsLeft -= 1;
						var deltaGoals = parseInt(result.goalshome) - parseInt(result.goalsguest);
						if(result.goalshome == -1 || result.goalsguest == -1 || result.goalshome == null || result.goalsguest == null){
							return;
						} else if(deltaGoals > 0){
							nWin += 1;
						} else if (deltaGoals == 0){
							nDraw += 1;
						} else if (deltaGoals < 0){
							nLoss += 1;
						}
						if(homeTeamResultsLeft == 0){
							Result.find({teamguest:this.name}).exec(function(err,innerResults){
								innerResults.forEach(function(innerResult){
									var deltaGoals = innerResult.goalshome - innerResult.goalsguest;
									if(innerResult.goalshome == -1 || innerResult.goalsguest == -1
											|| innerResult.goalshome == null || innerResult.goalsguest == null){
										return;
									} else if(deltaGoals < 0){
										nWin += 1;
									} else if (deltaGoals == 0){
										nDraw += 1;
									} else if (deltaGoals > 0){
										nLoss += 1;
									}
								});
								callback({wins : nWin, draws : nDraw, losses : nLoss});
							});
						}
					});
				});
			}
		}
};
