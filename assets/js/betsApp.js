var betsApp = angular.module('betsApp', []); // Defines an angular module

betsApp.controller('BetsController', function($scope, $http, $log) {
	// $log is used for console log
	// $http is used to communicate with the server
	// $scope defines the scope of controller
	var matchdays = [];
	for (var i = 1; i < 35; i++) {
		matchdays.push({
			"value" : i
		});
	};
	//Get the username for the logged-in user
	$http({method: 'GET',
		url : '/username'}).success(function(data){
			$scope.user = data.username;
		})
	$(document).ready(function() {
		$("#successAlert").hide();
		$("#failAlert").hide();
	});
	$scope.matchdays = matchdays;
	$scope.printSelectedMatchday = function() {
		$scope.matches = [];
		$http.get('/bet',
				{params : {	"matchday" : $scope.matchdaySelector.value,
							"user" : $scope.user}
		}).success(function(bets) {
			if(bets.length == 0){
				$http.get("/result",{
					params : {
						matchday : $scope.matchdaySelector.value
					}
				}).success(function(data){
					//Little unfortunate naming of variables when building the bet from the match
					var matchesLeft = data.length;
					data.forEach(function(match){
						$http.post('/bet',{
							match : match.id,
							user : $scope.user,
							matchday:match.matchday,
							teamhome : match.teamhome,
							teamguest : match.teamguest});
						match.goalshome = -1;
						match.goalsguest = -1;
						match.match = match.id;
						match.user = $scope.user;
						delete match.id;
						matchesLeft -= 1;
						if(matchesLeft == 0){
							$scope.matches = data;
						}
					});
				});
			}else{
				console.log(bets);
				$scope.matches = bets;
			}
		});
	};
	$scope.updateBets = function() {
		var matches = $scope.matches;
		console.log(matches);
		$http({
			method : "POST",
			url : "/bets/update",
			data : {
				matches 	: matches,
				username 	: $scope.username,
				matchday	: $scope.matchdaySelector.value
			}
		}).success(function(data) {
			$("#successAlert").alert();
			$("#successAlert").fadeTo(2000, 500).slideUp(500, function() {
				$("#successAlert").hide();
			});
		});/*.fail(function(data) {
			$("#failAlert").alert();
			$("#failAlert").fadeTo(2000, 500).slideUp(500, function() {
				$("#failAlert").alert('close');
			});
		});*/
	};
});
