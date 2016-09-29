

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
		'/currentMatchday':{
			controller : 'main',
			action : 'currentMatchday'
		},
		'/loadMatchday':{
			controller: 'bet',
			action: 'loadMatchday'
		},
		'/timeline' : {
			controller : 'bet',
			action : 'pointsWithTime'
		}
};
