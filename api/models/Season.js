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
				required: true,
				minLength: 1
			},
			leagueSeason: {
				type: 'STRING',
				unique: true,
				required: true,
				minLength: 1
			},
			bet: {
				collection: 'bet',
				via : 'season'
			}
		}
};

