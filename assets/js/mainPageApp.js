var mainPageApp = angular.module('mainPageApp', []);	// Defines an angular
														// module
mainPageApp.controller('MainPageController', function($scope, $http, $log/*,flash*/) {
	// $log is used for console log
	// $http is used to communicate with the server
	// $scope defines the scope of controller
	
	/*
	mainPageApp.factory("flash", function($rootScope) {
		var queue = [];
		var currentMessage = "asdf";

		//$rootScope.$on("$routeChangeSuccess", function() {
		currentMessage = queue.shift() || "";
		//});

		return {
			setMessage: function(message) {
				queue.push(message);
			},
			getMessage: function() {
				return currentMessage;
			}
		};
	});
	*/

	/*
	mainPageApp.controller('FlashController',function($scope,flash){
		$scope.data = flash.getMessage();
	});
	*/
	
	//$scope.flash = flash;
	
	$scope.pointsCorrect = 5;
	$scope.pointsDifference = 3;
	$scope.pointsTrend = 1;
	
	$scope.pointsForBet = function(betCode){
		var points = 0
		switch (parseInt(betCode)) {
		case 3:
			points = 5;
			break;
		case 2:
			points = 3;
			break;
		case 1:
			points = 1;
			break;
		default:
			break;
		}
		return points;
	};
	
	$scope.selectedMatchday = {"name":"1. Spieltag","value":"1"};
	
	/*
	 * Create list of matchdays for selector
	 */
	var matchdays = [];
	for (var i = 1; i < 35; i++) {
		matchdays.push({
			"name" : i + '. Spieltag',
			"value" : i
		});
	};
	$scope.matchdays = matchdays;
	
	/*
	 * Get Seasons that are stored in local DB
	 */
	getSeasons = function(){
		//Get the seasons
		$http.get('/season').success(function(data){
			$scope.seasons = data;
		});
	}
	
	/*
	 * Add a new season to database
	 */
	$scope.addSeason = function(){
		window.location.href = "/season/new";
	}
	
	/*
	 * Fill the bets for the matchday in the angular driven table
	 * Creates bets, if necessary
	 */
	$scope.printSelectedMatchday = function(){
		$http.get('/bet',
				{params : {	"matchday" : $scope.selectedMatchday.value,
							"user" : $scope.user.id,
							"season" : $scope.selectedSeason
				}}).success(function(data){
					$scope.bets = data;
					if(data.length == 0){
						$http.get('/loadMatchday',
								{params : {	"matchday" : $scope.selectedMatchday.value,
									"user" : $scope.user.id,
									"season" : $scope.selectedSeason
						}}).success(function(data){
							$scope.bets = data;
						}).error(function(data){
							alert("Datenbankfehler! OpenLigaDB möglicherweise unerreichbar.");
						});
					}
				});
	};

	$scope.refresh = function(){
		$http.get('/refresh',
				{params : {	"matchday" : $scope.selectedMatchday.value,
					"season" : $scope.selectedSeason
				}}).success(function(data){
					console.log(data);
					$scope.bets = data;
				});
	};
	
	/*
	 * Login 
	 */
	$scope.login = function(){
		var username = $("#loginName").val();
		var password = $("#loginPassword").val();
		if (username && password) {
			$.post('/login', {
				username : username,
				password : password
			}, function() {
				window.location = "/";
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
	
	/*
	 * Get whether a user is logged in and store
	 * user instance in scope
	 */
	var isUserLoggedIn = function(){
		//Get the username for the logged-in user
		$http.get('/currentUser').success(function(data){
			if(data.user){
				$scope.$parent.loggedIn = true;
				$scope.user = data.user;
			}
		});
	}
	
	/*
	 * Call to server to find the current matchday
	 */
	$scope.getCurrentMatchday = function(){
		$http.get('/currentMatchday',
				{params:{'season':$scope.selectedSeason}}
		).success(function(data){
			$scope.selectedMatchday = $scope.matchdays[data.currentMatchday-1];
			//Handle error
			$scope.printSelectedMatchday();
		})
	}
	
	/*
	 * Call update for the listed bets
	 */
	$scope.storeUpdates = function(){
		$scope.bets.forEach(function(bet){
			$http.post('/bet/' + bet.id,
					bet ).success(function(data){
						$scope.printSelectedMatchday();
					});
		});
	};
	
	$scope.getSum = function(item){
		return parseInt(item.nTrend)*$scope.pointsTrend + 
		parseInt(item.nDiff)*$scope.pointsDifference +
		parseInt(item.nCorrect)*$scope.pointsCorrect;
	}
	
	$scope.getRanking = function() {
		$http({
			method : "GET",
			url : "/user",
			params : {"season" : $scope.selectedSeason}
		}).success(function(data) {
			var result = data.userRankings;
			$scope.users = data;
		}).error(function(data) {
			alert("Fails");
		});
	}
	
	var getTeamRanking = function(){
		$http({
			method : "GET",
			url : "/team",
		}).success(function(data) {
			//This is a hotfix. On creation of the team objects the data type was
			//probably wrong. If the model really contains int this might be unecessary
			data.forEach(function(team){
				team.wins = parseInt(team.wins);
				team.losses = parseInt(team.losses);
				team.draws = parseInt(team.draws);
				team.points = parseInt(team.points);
			});	
			$scope.teams = data;
		}).error(function(data) {
			alert("Team Ranking Fails");
		});
	}
	var timeline = function createTimelinePlot(data) {
		var margin = {top: 20, right: 20, bottom: 30, left: 40},
		width = 960 - margin.left - margin.right,
		height = 300 - margin.top - margin.bottom;
		
		var xMax = 1;
		var zDomain = [];
		
		data.forEach(function(timelineObject){
			timelineLength = timelineObject.timeline.length;
			maxLocalMatchday = 1
			//Search maximum in timeline of a user first
			//then search global maximum
			timelineObject.timeline.forEach(function(dataPoint){
				if(maxLocalMatchday < dataPoint.matchday){
					maxLocalMatchday = dataPoint.matchday;
				}
			});
			if (xMax < maxLocalMatchday ){
				xMax = maxLocalMatchday;
			}
			zDomain.push(timelineObject.user);
		});
		
		var xExtents = [0,xMax];
		var yExtents = [0,41];

		var svg = d3.select("#timeline")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		var x = d3.scale.linear()
		.range([0, width])
		.domain([0,xExtents[1]+1]);

		var y = d3.scale.linear()
		.range([height, 0])
		.domain([0,yExtents[1]]);

		var z = d3.scale.category10().domain(zDomain);

		var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

		var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");

		svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis)
		.append("text")
		.attr("class", "label")
		.attr("x", width)
		.attr("y", -6)
		.style("text-anchor", "end")
		.text("Spieltag");

		svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("class", "label")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".5em")
		.style("text-anchor", "end")
		.text("Punkte");

		svg.selectAll('.dotContainer').data(data).enter()
		.append('g')
		.attr('class',function(d){return d.user})
		.selectAll(".dot")
		.data(function(d){
			pointDataList = [];
			d.timeline.forEach(function(point){
				pointDataList.push({"matchday" : point.matchday,"points" : point.points,"user" : d.user});
			});
			return pointDataList;
		})
		.enter().append("circle")
		.attr("class", "dot")
		.attr("r", 3.5)
		.attr("cx", function(d) { return x(d.matchday); })
		.attr("cy", function(d) { return y(d.points); })
		.style("fill", function(d) { return z(d.user); });

		legend = svg.append("g")
		.attr("class","legend")
		.attr("width", 100)
		.attr("height", 50)
		.attr("x",width-100)
		.attr("y",height-50)
		.style("font-size","12px");

		legend.selectAll('g').data(zDomain)
		.enter().append('g')
		.attr("transform","translate(" + (width - 100) + ",0)")
		.each(function(d,i){
			var g = d3.select(this);
			g.append("circle")
			.attr("r",3.6)
			.attr("cy",3.5 + i*15)
			.attr("cx",3.5)
			.attr("fill",z(d));
			g.append("text")
			.attr("x", 10.5)
			.attr("y", 3.5 + i*15)
			.attr("dy", ".35em")
			.text(function(d) { return d; });
		});

		var lineFunction = d3.svg.line()
		.x(function(d) { return x(d.matchday); })
		.y(function(d) { return y(d.points); })
		.interpolate("linear");

		svg.selectAll('.lineContainer').data(data)
		.enter()
		.append('g')
		.attr('class','lineContainer')
		.append('path')
		.attr("d",function(d){ return lineFunction(d.timeline);})
		.attr("stroke",function(d){return z(d.user);})
		.attr("stroke-width", 2)
		.attr("fill", "none")
		.attr("stroke-dasharray", function() { return this.getTotalLength(); })
		.attr('stroke-dashoffset', function() { return this.getTotalLength(); })
		.transition()
		.duration(5000)
		.ease("linear")
		.attr("stroke-dashoffset",0)
		    
	}
	
	//Call functions when page is done
	isUserLoggedIn();
	$scope.getRanking();
	getTeamRanking();
	$http.get('timeline').success(function(data){
		timeline(data);
	});
	getSeasons();
});
