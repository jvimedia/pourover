'use strict';

angular.module('pourOver').factory('Feeds', ['$q', '$rootScope', 'ApiClient', function ($q, $rootScope, ApiClient) {

  var DEFAULT_FEED_OBJ = {
    max_stories_per_period: 1,
    schedule_period: 1,
    format_mode: 1,
    include_thumb: true,
    include_video: true
  };

  $rootScope.feed = _.extend({}, DEFAULT_FEED_OBJ);
  $rootScope.feeds = [];
  var selected_feed = false;
  var new_feed = false;

  var updateFeeds = function () {
    ApiClient.get({
      url: 'feeds'
    }).success(function (resp) {
      if (resp.data && resp.data.length) {
        $rootScope.feeds = resp.data;
        console.log($rootScope.feeds);
        if (new_feed) {
          new_feed = false;
          return;
        }
        if (!selected_feed) {
          $rootScope.feed = resp.data[0];
        } else {
          _.each($rootScope.feeds, function (item) {
            if (item.feed_id === +selected_feed) {
              $rootScope.feed = item;
            }
          });
          selected_feed = false;
        }
      }
    });
  };

  updateFeeds();

  return {
    DEFAULT_FEED_OBJ: DEFAULT_FEED_OBJ,
    serialize_feed: function (feed) {
      _.each(['linked_list_mode', 'include_thumb', 'include_summary', 'include_video'], function (el) {
        if (!feed[el]) {
          delete feed[el];
        }
      });
      return feed;
    },
    setFeed: function (feed_id) {
      selected_feed = feed_id;
      _.each($rootScope.feeds, function (item) {
        if (item.feed_id === +selected_feed) {
          $rootScope.feed = item;
        }
      });
    },
    setNewFeed: function () {
      new_feed = true;
      $rootScope.feed = _.extend({}, DEFAULT_FEED_OBJ);
    },
    deleteFeed: function (feed_id) {
      var deferred = $q.defer();

      ApiClient.delete({
        url: 'feeds/' + feed_id
      }).success(function () {
        $rootScope.feeds = _.filter($rootScope.feeds, function (item) {
          return item.feed_id !== feed_id;
        });
        deferred.resolve();
      });

      return deferred.promise;
    },
    updateFeeds: updateFeeds
  };

}]);