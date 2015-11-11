var mainPageApp = angular.module('mainPageApp', []); // Defines an angular
														// module

mainPageApp.controller('MainPageController', function($scope, $http, $log) {
	// $log is used for console log
	// $http is used to communicate with the server
	// $scope defines the scope of controller
	var isUserLoggedIn = function(){
		//Get the username for the logged-in user
		$http.get('/username').success(function(data){
			if(data.username){
				$scope.$parent.loggedIn = true;
			}
		});
	}
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
	isUserLoggedIn();
});
