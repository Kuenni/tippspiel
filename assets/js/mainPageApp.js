var mainPageApp = angular.module('mainPageApp', []); // Defines an angular
														// module

mainPageApp.controller('MainPageController', function($scope, $http, $log) {
	// $log is used for console log
	// $http is used to communicate with the server
	// $scope defines the scope of controller
	
	$scope.pointsCorrect = 5;
	$scope.pointsDifference = 3;
	$scope.pointsTrend = 1;
	
	$scope.getSum = function(item){
		return parseInt(item.tendency)*$scope.pointsTrend + 
		parseInt(item.difference)*$scope.pointsDifference +
		parseInt(item.correct)*$scope.pointsCorrect;
	}

	$scope.login = function(){
		var username = $("#loginName").val();
		var password = $("#loginPassword").val();
		if (username && password) {
			$.post('/login', {
				username : username,
				password : password
			}, function() {
				window.location = "/bets";
			}).fail(function(res, textStatus, err) {
				console.log("res: " + res);
				console.log("status: " + textStatus);
				console.log("err: " + err);
				var responseJSON = $.parseJSON(res.responseText);
				alert("Error: " + responseJSON.error);
			});
		} else {
			alert("A username and password is required");
		}
		return false;
	}
	
	var isUserLoggedIn = function(){
		//Get the username for the logged-in user
		$http.get('/username').success(function(data){
			if(data.username){
				$scope.$parent.loggedIn = true;
			}
		});
	}
	var getRanking = function() {
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
	getRanking();
});
