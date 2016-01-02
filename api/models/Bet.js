/**
 * Bets.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

function sign(x){
    if( +x === x ) { // check if a number was given
        return (x === 0) ? x : (x > 0) ? 1 : -1;
    }
    return NaN;
}

module.exports = {

		attributes: {
			user: 'STRING',
			matchday: 'INT',
			teamhome: 'STRING',
			teamguest:'STRING',
			goalshome: 'INT',
			goalsguest: 'INT',
			season: 'STRING',
			betresultcode: 'INT',
			userMod: {
				model: 'user'
			},
			match : {
				model: 'result'
			},
			getBetResultCode : function(){
				if (this.match.goalsguest == -1 || this.match.goalshome == -1 ||
						this.goalsguest == -1 || this.goalshome == -1 ){
					return -1;
				}
				var deltaGoalsResult = this.match.goalshome - this.match.goalsguest;
				var deltaGoalsBet = this.goalshome - this.goalsguest;
				//Correct bet
				if(this.match.goalshome == this.goalshome && this.match.goalsguest == this.goalsguest){
					return 3;
				}
				//Correct difference
				else if (deltaGoalsResult == deltaGoalsBet){
					return 2;
				}
				//Correct tendency
				else if(sign(deltaGoalsResult) == sign(deltaGoalsBet)){
					return 1;
				}
				return 0;
			}
		}
};
