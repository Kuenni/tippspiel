var mainPageApp = angular.module('mainPageApp', []); // Defines an angular
														// module

mainPageApp.controller('MainPageController', function($scope, $http, $log) {
	// $log is used for console log
	// $http is used to communicate with the server
	// $scope defines the scope of controller
	$scope.getRanking = function() {
		$http({
			method : "GET",
			url : "/createUserRanking",
		}).success(function(data) {
			var result = data.userRankings;
			$scope.userRankings = result;
		}).error(function(data) {
			alert("Fails");
		});
	}
});
