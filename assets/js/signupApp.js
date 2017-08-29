var mainPageApp = angular.module('signupApp', ['ngAnimate']);	// Defines an angular
														// module
mainPageApp.controller('SignupController', function($scope, $http, $log) {
	// $log is used for console log
	// $http is used to communicate with the server
	// $scope defines the scope of controller

	$scope.signup = function() {
		var username = $("#signupName").val();
		var password = $("#signupPassword").val();
		var confirmPassword = $("#signupConfirmPassword").val();
		if (username && password) {
			if (password === confirmPassword) {
				$http.post('/signup',
						{	"username" : username,
							"password" : password
						}).then(function success(response){
							window.location = "/";
						}, function error(response){
							alert(response.data.message);
						});
			} else {
				alert("Passwords don't match");
			}
		} else {
			alert("A username and password is required");
		}
		return false;
	};


});
