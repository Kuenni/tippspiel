/**
 * SeasonController
 *
 * @description :: Server-side logic for managing Seasons
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	'new': function(req,res) {
			res.view();
	},
	create : function(req,res){
		var params = _.extend(req.query || {}, req.params || {}, req.body || {});
	  	Season.create(params, function seasonCreated (err, createdSeason) {
	  		if (err){
	  			console.log(err['reason']);
	  			console.log();
	  			console.log(err['details'])
	  			req.session.messages['error'].push(err['details']);
	  			return res.redirect('season/new');
	  		}
	  		return res.redirect('/');
	  	});
	}
};

