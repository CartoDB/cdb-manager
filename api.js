var api = angular.module("api", []);

function sendRequest(obj, request, httpService, action, error) {
    obj.running = true;
    obj.valid = null;
    obj.raw = null;

    // action and error are functions for the promise. if defined they'll be run after the default action and error functions
    var _action = function (result) {
        obj.raw = result;
        obj.valid = true;

        if (action) {
            action(result);
        }

        obj.running = false;
    };

    var _error = function (result) {
        obj.raw = result;
        obj.valid = false;

        if (error) {
            error(result);
        }

        obj.running = false;
    };

    httpService(request).then(_action).catch(_error);
}

api.factory('SQLClient', ["$http", "endpoints", "alerts", function ($http, endpoints, alerts) {
    return function () {
        this.items = null;
        this.errorMessage = null;

        this.send = function (query, action, error) {
            var currentEndpoint = endpoints.current;

            if (currentEndpoint && currentEndpoint.sqlURL) {
                var self = this;

                var req = {
                    method: 'GET',
                    url: currentEndpoint.sqlURL,
                    params: {
                        q: query,
                        api_key: currentEndpoint.apiKey
                    }
                };

                var _action = function (result) {
                    if (result.data && result.data.rows.length > 0) {
                        self.items = result.data.rows;
                    } else {
                        self.items = null;
                    }
                    self.errorMessage = null;

                    if (action) {
                        action(result);
                    }
                };

                var _error = function (result) {
                    self.items = null;
                    // We assume 400s are only coming from the SQL console
                    if (result.status == 400) {
                        self.errorMessage = result.data.error[0];
                    } else {
                        self.errorMessage = result.statusText;
                        if (self.errorMessage) {
                            alerts.add("error", "Endpoint error: " + self.errorMessage);
                        } else {
                            alerts.add("error", "Unknown endpoint error");
                        }
                    }

                    if (error) {
                        error(result);
                    }

                };

                sendRequest(this, req, $http, _action, _error);
            }
        }
    }
}]);

api.factory('MapsClient', ["$http", "endpoints", function ($http, endpoints) {
    return function () {
        this.send = function () {
            var currentEndpoint = endpoints.current;

            if (currentEndpoint && currentEndpoint.mapsURL) {
                var req = {
                    method: 'GET',
                    url: currentEndpoint.mapsURL + "/named",
                    params: {
                        api_key: currentEndpoint.apiKey
                    }
                };

                var self = this;

                sendRequest(this, req, $http, function (result) {
                    self.items = [];
                    for (var i = 0; i < result.data.template_ids.length; i++) {
                        self.items.push({name: result.data.template_ids[i]});
                    }
                });
            }
        };
    }
}]);
