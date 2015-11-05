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
		$http({
			method : "POST",
			url : "/listBets",
			data : {
				matchday : $scope.matchdaySelector.value,
				username : $scope.username
			}
		}).success(function(data) {
			var result = data.bets;
			if(result.length == 0){
				console.log('Zero length bet');
				$http({
					method : "POST",
					url : "/listMatchday",
					data : {
						matchday : $scope.matchdaySelector.value
					}
				}).success(function(data){
					var matchesLeft = data.matches.length;
					data.matches.forEach(function(match){
						match.goalshome = -1;
						match.goalsguest = -1;
						delete match.id;
						matchesLeft -= 1;
						if(matchesLeft == 0){
							$scope.matches = data.matches;
						}
					});
				});
			}else{
				$scope.matches = result;
			}
		});
	};
	$scope.updateBets = function() {
		var matches = $scope.matches;
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
				$("#successAlert").alert('close');
			});
		});/*.fail(function(data) {
			$("#failAlert").alert();
			$("#failAlert").fadeTo(2000, 500).slideUp(500, function() {
				$("#failAlert").alert('close');
			});
		});*/
	};
});
