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
	    playerHeight: '422',
	    playerWidth: '640',
	    state: 'stopped'
    };
	var results = [];
	var playlist = [];
  var currTitle = '[MV] 여자친구(GFRIEND) _ 시간을 달려서(Rough)';
  var counter = -1;

  $window.onYouTubeIframeAPIReady = function () {
    $log.info('Youtube API is ready');
    youtube.ready = true;
    service.bindPlayer('placeholder');
    service.loadPlayer();
    $rootScope.$apply();
  };

  function onYoutubeReady (event) {
    $log.info('YouTube Player is ready');
    youtube.player.cueVideoById('0VKcLPdY9lI');
    youtube.videoId = '0VKcLPdY9lI';
    youtube.videoTitle = '[MV] 여자친구(GFRIEND) _ 시간을 달려서(Rough)';
  }

  function onYoutubeStateChange (event) {
    if (event.data == YT.PlayerState.PLAYING) {
      youtube.state = 'playing';
    } else if (event.data == YT.PlayerState.PAUSED) {
      youtube.state = 'paused';
    } else if (event.data == YT.PlayerState.ENDED) {
      youtube.state = 'ended';
      counter++;
      if(counter < playlist.length) {
        service.launchPlayer(playlist[counter].id, playlist[counter].title, counter);
        $rootScope.videotitle = YTService.getTitle();
      }
      
    }
    $rootScope.$apply();
  }

  this.bindPlayer = function (elementId) {
    youtube.playerId = elementId;
  };

  this.createPlayer = function () {
    return new YT.Player(youtube.playerId, {
      height: youtube.playerHeight,
      width: youtube.playerWidth,
      playerVars: {
        rel: 0,
        showinfo: 0
      },
      events: {
        'onReady': onYoutubeReady,
        'onStateChange': onYoutubeStateChange
      }
    });
  };

  this.loadPlayer = function () {
    if (youtube.ready && youtube.playerId) {
      if (youtube.player) {
        youtube.player.destroy();
      }
      youtube.player = service.createPlayer();
    }
  };

  this.launchPlayer = function (id, title, index) {
    youtube.player.loadVideoById(id);
    youtube.videoId = id;
    youtube.videoTitle = title;
    currTitle = title;
    counter = index;
    return youtube;
  }

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

  this.addToPlaylist = function (id, title) {
    playlist.push({
      id: id,
      title: title
    });
    return playlist;
  }

  this.clearPlaylist = function() {
    playlist.splice(0,playlist.length);
    return playlist;
  }

  this.removeVid = function(index) {
    playlist.splice(index,1);
  }

	this.getYoutube = function () {
  	return youtube;
	};

	this.getResults = function () {
  	return results;
	};
  
  this.getPlaylist = function() {
    return playlist;
  };

  this.getTitle = function() {
    return currTitle;
  };
}]);

app.controller('YRCtrl', function ($scope, $http, $log, YTService) {
	init();

    function init() {
      $scope.youtube = YTService.getYoutube();
      $scope.results = YTService.getResults();
      $scope.playlist = YTService.getPlaylist();
      $scope.videotitle = YTService.getTitle();
    }

    $scope.search = function () {
      $http.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          key: 'AIzaSyDVQpYlJfj0jKbGCy2TFvi9Le4zRZrzmSs',
          type: 'video',
          maxResults: '15',
          part: 'id,snippet',
          fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle',
          q: this.query
        }
      })
      .success( function (data) {
        YTService.listResults(data);
      })
      .error( function () {
      	$log.info('Search error');
      });
    }

    $scope.queue = function(id, title) {
      YTService.addToPlaylist(id,title);
    }

    $scope.play = function(id, title, index) {
      YTService.launchPlayer(id, title, index);
      $scope.videotitle = YTService.getTitle();
    }

    $scope.clearList = function() {
      YTService.clearPlaylist();
    }

    $scope.removeVideo = function(index) {
      YTService.removeVid(index);
    }

    $scope.$watch(function () { return YTService.getTitle() }, function (newVal, oldVal) {
    if (typeof newVal !== 'undefined') {
        $scope.videotitle = YTService.getTitle();
    }
});

});
