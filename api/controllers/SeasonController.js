/**
 * SeasonController
 *
 * @description :: Server-side logic for managing Seasons
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	'new': function(req,res) {
			res.view({layout:null});
	},
	create : function(req,res){
		var params = req.body || {};
	  	Season.create(params, function seasonCreated (err, createdSeason) {
	  		if (err){
	  			//req.session.messages['error'].push(err['details']);
	  			return res.send(420,err);
	  		}
	  		return res.redirect('/');
	  	});
	},
	index: function(req,res){
		Season.find().exec(function(err,seasons){
			if(err){
				sails.log.error('SeasonController - index: Error finding season data.');
				sails.log.error(err);
				return res.send(500,err);
			}
			return res.json(seasons);
		});
	}
};

