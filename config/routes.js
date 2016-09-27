

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
		'/currentUser' : {
			controller : 'main',
			action : 'currentUser'
		},
		'/results' : {
			controller : 'result',
			action : 'results'
		},
		'/loadData':{
			view: 'main/loadData'
		},
		'/loadMatchday':{
			controller: 'bet',
			action: 'loadMatchday'
		},
		'/addToDatabase':{
			controller: 'main',
			action : 'addToDatabase'
		},
		'/results/update':{
			controller: 'main',
			action: 'updateResults'
		},
		'/bets' : {
			controller : 'bet',
			action : 'bets'
		},
		'/bets/update' : {
			controller : 'bet',
			action : 'updateBets'
		},
		'/timeline' : {
			controller : 'bet',
			action : 'pointsWithTime'
		}
};
