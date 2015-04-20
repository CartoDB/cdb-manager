var api = angular.module("api", []);

function sendRequest(obj, request, action, error, httpService) {
    obj.running = true;

    if (!action) {
        // default action function
        action = function (result) {
            obj.raw = result;
            obj.running = false;
        }
    }

    if (!error) {
        // default error function
        error = function (result) {
            obj.raw = null;
            var errorMessage = result.statusText ? result.statusText : result.data;
            if (result.data && result.data.error) {
                errorMessage += " (" + result.data.error + ")";
            }
            alerts.add("error", "Endpoint error: " + errorMessage);
            obj.running = false;
        }
    }

    httpService(request).then(action).catch(error);
}


api.factory('SQLClient', ["$http", "endpoints", "alerts", function ($http, endpoints, alerts) {
    return function () {
        this.lastQueryId = 0;  // id to keep track of query changes

        // action and error are functions for the promise. if undefined, default functions will be used
        this.get = function (query, action, error) {
            var currentEndpoint = endpoints.current;

            if (currentEndpoint && currentEndpoint.sqlURL) {
                var req = {
                    method: 'GET',
                    url: currentEndpoint.sqlURL,
                    params: {
                        q: query,
                        api_key: currentEndpoint.apiKey
                    }
                };

                var self = this;

                sendRequest(this, req, function (result) {
                    self.raw = result;
                    self.items = result.data.rows;
                    self.error400 = null;
                    self.running = false;
                    ++self.lastQueryId;
                }, function (result) {
                    self.items = null;
                    self.raw = null;
                    if (result.status == 400) {
                        self.error400 = result.data.error[0];
                    } else {
                        var errorMessage = result.statusText;
                        self.error400 = null;
                        if (errorMessage) {
                            alerts.add("error", "Endpoint error: " + errorMessage);
                        } else {
                            alerts.add("error", "Unknown endpoint error");
                        }
                    }
                    self.running = false;
                    ++self.lastQueryId;
                }, $http);
            }
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

            if (currentEndpoint && currentEndpoint.mapsURL) {
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
            }
        };
    }
}]);
