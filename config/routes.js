

module.exports.routes = {


		'/' : {
			controller : 'main',
			action : 'index'
		},
		'/signup' : {
			controller: 'main',
			action: 'signup'
		},
		'/login' : {
			controller: 'main',
			action: 'login'
		},
		'/logout' : {
			controller: 'main',
			action: 'logout'
		},
		'/username' : {
			controller : 'main',
			action : 'getUser'
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
		},
		'/createUserRanking' : {
			controller : 'main',
			action : 'createUserRanking'
		}

};
