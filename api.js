var api = angular.module("api", []);

api.factory('SQLClient', ["$http", "endpoints", "alerts", function ($http, endpoints, alerts) {
    return function () {
        // action and error are functions for the promise. if undefined, default functions will be used
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
                // default action function
                action = function (result) {
                    self.raw = result;
                    self.items = result.data.rows;
                    self.time = result.data.time;
                }
            }
            if (!error) {
                // default error function
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
