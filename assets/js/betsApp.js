var betsApp = angular.module('betsApp', []); // Defines an angular module

betsApp.controller('BetsController', function($scope, $http, $log) {
	// $log is used for console log
	// $http is used to communicate with the server
	// $scope defines the scope of controller
	var matchdays = [];
	for (var i = 1; i < 35; i++) {
		matchdays.push({
			"name" : i + '. Spieltag',
			"value" : i
		});
	};
	$scope.matchdays = matchdays;
	
	$scope.pointsCorrect = 5;
	$scope.pointsDifference = 3;
	$scope.pointsTrend = 1;
	
	$scope.getPointsForBet = function(resultcode){
		switch(+resultcode){
		case 3:
			return 5;
			break;
		case 2:
			return 3;
			break;
		case 1:
			return 1;
			break;
		default:
			return 0;
		break;
		}
	}
	//Get the username for the logged-in user
	$http({method: 'GET',
		url : '/username'}).success(function(data){
			$scope.user = data.username;
		});
	$(document).ready(function() {
		$("#successAlert").hide();
		$("#failAlert").hide();
	});
	$scope.printSelectedMatchday = function() {
		$scope.matches = [];
		if($scope.matchdaySelector == undefined){
			return;
		}
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
							teamguest : match.teamguest,
							goalshome : -1,
							goalsguest: -1});
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
				$scope.matches = bets;
			}
		});
	};
	$scope.updateBets = function() {
		var matches = $scope.matches;
		if($scope.matchdaySelector == undefined){
			return;
		}
		$http({
			method : "POST",
			url : "/bets/update",
			data : {
				matches 	: matches,
				username 	: $scope.username,
				matchday	: $scope.matchdaySelector.value
			}
		}).success(function(data) {
			$scope.matches = data;
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
	//Get current matchday
	$http({method: 'GET',
		url : 'http://www.openligadb.de/api/getcurrentgroup/bl1'}).success(function(data){
			$scope.matchdaySelector = $scope.matchdays[parseInt(data.GroupName.split('.')[0])];
			$scope.printSelectedMatchday();
		})
});
