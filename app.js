var app = angular.module('YouRequest', []);

app.run(function () {
  var tag = document.createElement('script');
  tag.src = "http://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});

app.service('YTService', ['$window', '$rootScope', '$log', function ($window, $rootScope, $log) {
	var service = this;

	var youtube = {
	    ready: false,
	    player: null,
	    playerId: null,
	    videoId: null,
	    videoTitle: null,
	    playerHeight: '480',
	    playerWidth: '640',
	    state: 'stopped'
    };
	var results = [];
	var upcoming = [];


	this.listResults = function (data) {
	    results.length = 0;
	    for (var i = 0; i < data.items.length - 1; i++) {
	      	results.push({
		        id: data.items[i].id.videoId,
		        title: data.items[i].snippet.title,
		        description: data.items[i].snippet.description,
		        thumbnail: data.items[i].snippet.thumbnails.default.url,
		        author: data.items[i].snippet.channelTitle
		    });
	    }
    	return results;
  	}

  	this.getYoutube = function () {
    	return youtube;
  	};

  	this.getResults = function () {
    	return results;
  	};
}]);

app.controller('YRCtrl', function ($scope, $http, $log, YTService) {
	init();

    function init() {
      $scope.youtube = YTService.getYoutube();
      $scope.results = YTService.getResults();
      $scope.playlist = true;
    }

    $scope.search = function () {
      $http.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          key: 'AIzaSyDVQpYlJfj0jKbGCy2TFvi9Le4zRZrzmSs',
          type: 'video',
          maxResults: '10',
          part: 'id,snippet',
          fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle',
          q: this.query
        }
      })
      .success( function (data) {
        YTService.listResults(data);
        $log.info(data);
      })
      .error( function () {
      	$log.info('Search error');
      });
    }

});
