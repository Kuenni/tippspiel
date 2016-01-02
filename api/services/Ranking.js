module.exports = {
	updateUserRanking : function() {
		User.find().populateAll().exec(function(err, users) {
			users.forEach(function(user) {
				user.updateNumberCorrectBets();
				user.updateNumberDifferenceBets();
				user.updateNumberTendencyBets();
			});
		});
	},
	updateTeamRanking : function(){
		Team.find().exec(function(err,teams){
			teams.forEach(function(team){
				team.getTeamStatistics(function(stats){
					team.wins = stats.wins;
					team.draws = stats.draws;
					team.losses = stats.losses;
					team.points = 3*stats.wins + 1 * stats.draws;
					team.save();
					return;
				});
			});
		});
	}
}