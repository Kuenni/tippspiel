

module.exports.routes = {


	'/' : {
		controller : 'main',
		action : 'index'
	},
	'/results' : {
		controller : 'main',
		action : 'results'
	},
	'/loadData':{
		view: 'main/loadData'
	},
	'/addToDatabase':{
		controller: 'main',
		action : 'addToDatabase'
	},
	'/listMatchday':{
		controller: 'main',
		action : 'listMatchday'
	},
	'/results/update':{
		controller: 'main',
		action: 'updateResults'
	},
	'/listBets':{
		controller : 'bet',
		action: 'listBets'
	},
	'/bets' : {
		controller : 'bet',
		action : 'bets'
	},
	'/bets/update' : {
		controller : 'bet',
		action : 'updateBets'
	}

};
