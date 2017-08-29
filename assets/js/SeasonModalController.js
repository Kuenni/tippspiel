var app = angular.module("mainPageApp");

app.controller("SeasonModalController", function($uibModalInstance, $scope, $http) {
  $scope.cancel = function () {
	  $uibModalInstance.close();
  };
  
  $scope.submitForm = function(){
	  $http.post('/season/create',
				$scope.season )
				.then(function(data){
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