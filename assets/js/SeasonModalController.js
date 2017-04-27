var app = angular.module("mainPageApp");

app.controller("SeasonModalController", function($uibModalInstance, $scope, $http) {
  $scope.cancel = function () {
	  $uibModalInstance.close();
  };
  
  $scope.submitForm = function(){
	  console.log("Das ist ein Test");
	  console.log($scope.season)
	  $http.post('/season/create',
				$scope.season )
				.then(function(data){
					console.log("then")
					console.log(data);
					window.location.href = "/";
				},
				function error(response){
					if(response.data.error == "E_VALIDATION"){
						alert("Validation error on creating new Season!");
					}
					return
				});
	  $uibModalInstance.close();
  }
});