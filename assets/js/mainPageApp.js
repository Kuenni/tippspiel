var mainPageApp = angular.module('mainPageApp', ['ngAnimate','ui.bootstrap']);	// Defines an angular
														// module
mainPageApp.controller('MainPageController', function($scope, $http, $log, $uibModal/*,flash*/) {
	// $log is used for console log
	// $http is used to communicate with the server
	// $scope defines the scope of controller
	
	$scope.isSeasonSelected = false;
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
		$http.get('/season').then(function(response){
			$scope.seasons = response.data;
		});
	}
	
	/*
	 * Add a new season to database
	 */
	$scope.addSeason = function(){
		$log.info("Add Season");
		$scope.isSeasonSelected = false;

		$uibModal.open({
			templateUrl: 'season/new', //Get the page from the controller (no layout.ejs)
			controller: 'SeasonModalController',
			size: 'md' //Medium size Modal
		});
		return true;
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
				}}).then(function success(response){
					$scope.bets = response.data;
					//TODO: Check this. Should not happen anymore
					if(response.data.length == 0){
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
				}, function error(data){
					console.log(data);
					
				});
	};

	$scope.refresh = function(){
		$scope.printSelectedMatchay();
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
	 * 
	 * FIXME: This is stuff that should be handled on server side!
	 */
	var isUserLoggedIn = function(){
		//Get the username for the logged-in user
		$http.get('/currentUser').then(function(response){
			if(response.data.user){
				$scope.$parent.loggedIn = true;
				$scope.user = response.data.user;
			}
			return;
		});
	}
	
	/*
	 * Call to server to find the current matchday
	 */
	$scope.seasonHasChanged = function(){
		if(!$scope.selectedSeason){
			return;
		} else if($scope.selectedSeason == -1){
			return $scope.addSeason()
		}
		$scope.isSeasonSelected = true;
		getRanking();
		$http.get('/currentMatchday',
				{params:{'season':$scope.selectedSeason}}
		).then(function(response){
			$scope.selectedMatchday = $scope.matchdays[response.data.currentMatchday-1];
			//Handle error
			$scope.printSelectedMatchday();
			return;
		})
	}
	
	var betNonEmpty = function(bet){
		return bet.betHome != -1 && bet.betGuest != -1;
	}
	
	/*
	 * Call update for the listed bets and reload data
	 * when all bets are processed
	 */
	$scope.storeUpdates = function(){
		var betsToUpdate = $scope.bets.filter(betNonEmpty);
		var betsLeft = betsToUpdate;
		betsToUpdate.forEach(function(bet){
			if(bet.betHome)
			$http.post('/bet/' + bet.id,
					bet ).then(function(data){
						betsLeft -= 1;
						if(!betsLeft){
							$scope.printSelectedMatchday();
						}
					},
					function error(err){
						$log.error("storeUpdates");
						$log.error(err);
					});
		});
	};
	
	$scope.getSum = function(item){
		return parseInt(item.nTrend)*$scope.pointsTrend + 
		parseInt(item.nDiff)*$scope.pointsDifference +
		parseInt(item.nCorrect)*$scope.pointsCorrect;
	}
	
	var getRanking = function() {
		$http.get("/user/ranking",
			{params : {"season" : $scope.selectedSeason}})
		.then(function success(data) {
			var result = data.userRankings;
			$scope.users = data;
		},function error(data) {
			alert("Get Ranking failed");
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
	//getTeamRanking();
	//$http.get('timeline').success(function(data){
	//	timeline(data);
	//});
	getSeasons();
});
