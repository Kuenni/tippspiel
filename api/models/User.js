/**
 * Users.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

		attributes: {
			username: 'STRING',
			password: 'STRING',
			cachedCorrect: {type: 'INT', defaultsTo: -1},
			cachedDiff: {type: 'INT', defaultsTo: -1},
			cachedTrend: {type: 'INT', defaultsTo: -1},
			cachedPoints: {type: 'INT', defaultsTo: -1},
			bets: {
				collection: 'bet',
				via : 'user'
			},
			/*
			 * Return cached attribute
			 */
			correct : function(){
				if(this.isNeedsUpdate()){
					this.updateCachedAttributes();
				}
				//Ensure no -1 values
				return this.cachedCorrect > 0 ? this.cachedCorrect : 0;
			},
			/*
			 * Return cached attribute
			 */
			difference : function(){
				if(this.isNeedsUpdate()){
					this.updateCachedAttributes();
				}	
				//Ensure no -1 values
				return this.cachedDifference > 0 ? this.cachedDifference : 0;
			},
			/*
			 * Return cached attribute
			 */
			trend : function(){
				if(this.isNeedsUpdate()){
					this.updateCachedAttributes();
				}
				//Ensure no -1 values
				return this.cachedTrend > 0 ? this.cachedTrend : 0;
			},
			/*
			 * Check whether update of the cached attributes is needed
			 */
			isNeedsUpdate : function(){
				return this.cachedCorrect == -1 || this.cachedDiff == -1 || this.cachedTrend == -1 || this.cachedPoints == -1;
			},
			/*
			 * Update the cached attributes in this bet
			 */
			updateCachedAttributes : function(){
				var nCorrect = 0;
				var nDiff = 0;
				var nTrend = 0;
				var points = 0;
				this.bets.forEach(function(bet){
					//unary + means cast to int
					points += bet.points;
					switch(+bet.betresultcode){
					case 3:
						nCorrect += 1;
						break;
					case 2:
						nDiff += 1;
						break;
					case 1:
						nTrend += 1;
						break;
					default:
						break;
					}
				});
				this.cachedCorrect = nCorrect;
				this.cachedDiff = nDiff;
				this.cachedTrend = nTrend;
				this.cachedPoints = points;
				this.save();
			}
		}
};

