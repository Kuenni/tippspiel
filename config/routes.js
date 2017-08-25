

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
		'/refresh':{
			controller: 'bet',
			action: 'refresh'
		},
		'/timeline' : {
			controller : 'bet',
			action : 'pointsWithTime'
		},
		'/user/ranking' : {
			controller : 'user',
			action : 'ranking'
		}
};
