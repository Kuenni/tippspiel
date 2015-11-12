module.exports = {
  isCurrentPage: function(req, controller, action) {
    return (req.options.controller === controller && req.options.action === action)
  },
	isUserLoggedIn: function(req){
		return ! (req.session.user === undefined);
	}
}