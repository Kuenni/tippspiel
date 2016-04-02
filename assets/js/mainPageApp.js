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
		return parseInt(item.nTrend)*$scope.pointsTrend + 
		parseInt(item.nDiff)*$scope.pointsDifference +
		parseInt(item.nCorrect)*$scope.pointsCorrect;
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
			url : "/user",
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
			var result = data.userRankings;
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
	
	
	isUserLoggedIn();
	getRanking();
	getTeamRanking();
	$http.get('timeline').success(function(data){
		timeline(data);
	});
});
