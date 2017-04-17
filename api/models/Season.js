/**
 * Season.js
 *
 * @description :: Model representation of openligadb data
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

		attributes: {
			seasonName: {
				type: 'STRING',
				unique: true,
				required: true,
				minLength: 1
			},
			leagueShortcut:{
				type: 'STRING',
				unique: true,
				required: true,
				minLength: 1
			},
			leagueSeason: {
				type: 'STRING',
				unique: true,
				required: true,
				minLength: 1
			},
			//TODO: Do I need this for the one-to-one mapping of bet to season?
			bet: {
				collection: 'bet',
				via : 'season'
			}
		}
};

