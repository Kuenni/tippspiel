var resultsApp = angular.module('resultsApp', []); // Defines an angular module

resultsApp.controller('ResultsController', function($scope, $http, $log) {
	// $log is used for console log
	// $http is used to communicate with the server
	// $scope defines the scope of controller
	var matchdays = [];
	for (var i = 1; i < 35; i++) {
		matchdays.push({
			"value" : i
		});
	};
	$(document).ready(function() {
		$("#successAlert").hide();
		$("#failAlert").hide();
	});
	$scope.matchdays = matchdays;
	$scope.printSelectedMatchday = function() {
		$http({
			method : "GET",
			url : "/result",
			params : {matchday : $scope.matchdaySelector.value}
		}).success(function(data) {
			$scope.matches = data;
		});
	};
	$scope.updateResults = function() {
		var matches = $scope.matches;
		$http({
			method : "POST",
			url : "/results/update",
			data : {
				matches : matches
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
