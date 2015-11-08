module.exports = {
	updateUserRanking : function() {
		User.find().populateAll().exec(function(err, users) {
			users.forEach(function(user) {
				user.updateNumberCorrectBets();
				user.updateNumberDifferenceBets();
				user.updateNumberTendencyBets();
			});
		});
	}
}