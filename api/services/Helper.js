module.exports = {
		/*
		 * Find out, whether a nav item links to the current page
		 */
		isCurrentPage: function(req, controller, action) {
			return (req.options.controller === controller && req.options.action === action)
		},
		/*
		 * Find out whether a user is logged in
		 */
		isUserLoggedIn: function(req){
			return ! (req.session.user === undefined);
		}
}