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
                    var errorMessage = result.statusText ? result.statusText : result.data;
                    if (result.data && result.data.error) {
                        errorMessage += " (" + result.data.error[0] + ")";
                    }
                    alerts.add("error", "Endpoint error: " + errorMessage);
                }
            }

            return $http(req).then(action).catch(error);
        }
    }
}]);

api.factory('MapsClient', ["$http", "endpoints", "alerts", function ($http, endpoints, alerts) {
    return function () {
        this.send = function (req, action, error) {
            var self = this;

            if (!action) {
                // default action function
                action = function (result) {
                    self.raw = result;
                }
            }

            if (!error) {
                // default error function
                error = function (result) {
                    self.raw = null;
                    var errorMessage = result.statusText ? result.statusText : result.data;
                    if (result.data && result.data.error) {
                        errorMessage += " (" + result.data.error + ")";
                    }
                    alerts.add("error", "Endpoint error: " + errorMessage);
                }
            }

            $http(req).then(action).catch(error);
        };

        this.get = function () {
            var currentEndpoint = endpoints.current;

            var req = {
                method: 'GET',
                url: currentEndpoint.mapsURL + "/named",
                params: {
                    api_key: currentEndpoint.apiKey
                }
            };

            var self = this;

            this.send(req, function (result) {
                self.raw = result;
                self.items = [];
                for (var i = 0; i < result.data.template_ids.length; i++) {
                    self.items.push({name: result.data.template_ids[i]});
                }
            });
        };
    }
}]);
