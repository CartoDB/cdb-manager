var api = angular.module("api", []);

// generic function for sending requests through a $http-like http service
// obj is the api object that makes the request
// action and error are promises to be run on success and error respectively and after the
// corresponding default promises have been run
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

// SQLClient makes request to CARTO's SQL API
// internal objects:
//   running, valid and raw from sendRequest
//   items: list of objects returned by the database on success
//   errorMessage: error message on error
api.factory('SQLClient', ["$http", "endpoints", "alerts", function ($http, endpoints, alerts) {
    return function () {
        var self = this;

        this.items = null;
        this.errorMessage = null;

        // action and error are functions for the promise. if defined they'll be run after the default action and error functions
        this.send = function (query, action, error) {
            var currentEndpoint = endpoints.current;

            if (currentEndpoint && currentEndpoint.sqlURL) {
                var params = {
                    q: query
                };
                if (currentEndpoint.apiKey) {
                    params.api_key = currentEndpoint.apiKey;
                }
                var req = {
                    method: 'GET',
                    url: currentEndpoint.sqlURL,
                    params: params
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
                    if (result.status == 400) {
                        // PostgreSQL error
                        self.errorMessage = result.data.error[0];
                    } else {
                        // Network error
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

                sendRequest(self, req, $http, _action, _error);
            }
        };
    };
}]);

// MapsClient makes request to CARTO's Maps API
// internal objects:
//   running, valid and raw from sendRequest
//   items: list of objects returned by the database on success
//   errorMessage: error message on error
api.factory('MapsClient', ["$http", "endpoints", "settings", function ($http, endpoints, settings) {
    return function () {
        var self = this;

        this.items = null;

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

                sendRequest(this, req, $http, function (result) {
                    self.items = [];
                    for (var i = 0; i < result.data.template_ids.length; i++) {
                        if (settings.showBuilderNamedMaps || !result.data.template_ids[i].startsWith("tpl_")) {
                            self.items.push({name: result.data.template_ids[i]});
                        }
                    }
                }, function () {
                    self.items = null;
                });
            }
        };
    }
}]);
