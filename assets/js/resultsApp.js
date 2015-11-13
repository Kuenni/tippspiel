var resultsApp = angular.module('resultsApp', []); // Defines an angular module

resultsApp.controller('ResultsController', function($scope, $http, $log) {
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
	$(document).ready(function() {
		$("#successAlert").hide();
		$("#failAlert").hide();
	});
	$scope.printSelectedMatchday = function() {
		$http({
			method : "GET",
			url : "/result",
			params : {matchday : $scope.matchdaySelector.value}
		}).success(function(data) {
			data.forEach(function(match){
				if(match.goalsguest == undefined){
					match.goalsguest = -1;
				}
				if(match.goalshome == undefined){
					match.goalshome = -1;
				}
			});
			$scope.matches = data;
		});
	};
	$scope.updateResults = function() {
		var matches = $scope.matches;
		if(matches == undefined){
			matches = [];
		}
		$http({
			method : "POST",
			url : "/results/update",
			data : {
				matches : matches
			}
		}).success(function(data) {
			$("#successAlert").alert();
			$("#successAlert").fadeTo(2000, 500).slideUp(500, function() {
				$("#successAlert").hide();
			});
		});
	};
	//Get current matchday
	$http({method: 'GET',
		url : 'http://www.openligadb.de/api/getcurrentgroup/bl1'}).success(function(data){
			$scope.matchdaySelector = $scope.matchdays[parseInt(data.GroupName.split('.')[0])];
			$scope.printSelectedMatchday();
		})
});
