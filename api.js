var api = angular.module("api", []);

api.factory('SQLClient', ["$http", "endpoints", "alerts", function ($http, endpoints, alerts) {
    return function () {
        this.get = function (query, action, error) {
            var currentEndpoint = endpoints.current;

            var req = {
                method: 'GET',
                url: currentEndpoint.url,
                params: {
                    q: query,
                    api_key: currentEndpoint.apiKey
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
                    var error_message = result.statusText ? result.statusText : result.data;
                    alerts.add("error", "Endpoint error: " + error_message);
                }
            }

            return $http(req).then(action).catch(error);
        }
    }
}]);
