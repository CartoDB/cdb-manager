var api = angular.module("api", []);

function sendRequest(obj, request, httpService, extraAction, extraError) {
    obj.running = true;
    obj.valid = null;
    obj.raw = null;

    // extraAction and extraError are functions for the promise. if defined they'll be run after the default action and error functions
    var action = function (result) {
        obj.raw = result;
        obj.valid = true;

        if (extraAction) {
            extraAction(result);
        }

        obj.running = false;
    };

    var error = function (result) {
        obj.raw = result;
        obj.valid = false;

        if (extraError) {
            extraError(result);
        }

        obj.running = false;
    };

    httpService(request).then(action).catch(error);
}

api.factory('SQLClient', ["$http", "endpoints", "alerts", function ($http, endpoints, alerts) {
    return function () {
//        this.lastQueryId = 0;  // id to keep track of query changes
        this.items = null;
        this.errorMessage = null;

        this.send = function (query, extraAction, extraError) {
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

                var action = function (result) {
                    if (result.data && result.data.rows.length > 0) {
                        self.items = result.data.rows;
                    } else {
                        self.items = null;
                    }
                    self.errorMessage = null;
//                    ++self.lastQueryId;

                    if (extraAction) {
                        extraAction(result);
                    }
                };

                var error = function (result) {
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
//                        ++self.lastQueryId;

                    if (extraError) {
                        extraError(result);
                    }

                };

                sendRequest(this, req, $http, action, error);
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
