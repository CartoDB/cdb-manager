var api = angular.module("api", []);

api.factory('SQLClient', ["$http", "servers", "alerts", function ($http, servers, alerts) {
    return function () {
        this.get = function (query, action, error) {
            var currentServer = servers.current;

            var req = {
                method: 'GET',
                url: currentServer.url,
                params: {
                    q: query,
                    api_key: currentServer.apiKey
                }
            };

            var self = this;
            if (!action) {
                action = function (result) {
                    self.raw = result;
                    self.items = result.data.rows;
                    self.time = result.data.time;
                }
            }
            if (!error) {
                error = function (result) {
                    self.items = null;
                    self.raw = null;
                    self.time = null;
                    alerts.add("error", "Server error: " + result.data);
                }
            }

            return $http(req).then(action).catch(error);
        }
    }
}]);
