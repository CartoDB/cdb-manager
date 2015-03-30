cdbmanager.service('api', ["$http", "servers", "alerts", function ($http, servers, alerts) {
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
                self.items = result.data.rows;
                self.time = result.data.time;
            }
        }
        if (!error) {
            error = function (result) {
                self.items = null;
                alerts.add("error", "Server error: " + result.data);
            }
        }

        return $http(req).then(action).catch(error);
    }
}]);
