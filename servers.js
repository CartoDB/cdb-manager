cdbmanager.service('servers', ["$localStorage", function ($localStorage) {
    $localStorage.servers = $localStorage.servers || [];

    if ($localStorage.servers) {
        this.current = $localStorage.servers[0];
    } else {
        this.current = null;
    }

    this.all = function () {
        return $localStorage.servers;
    };

    this.add = function (server) {
        var newServer = angular.copy(server);
        $localStorage.servers.push(newServer);
        this.current = newServer;
    };

    this.remove = function (server) {
        $localStorage.servers = $localStorage.servers.filter(function (_server) {
            return server != _server;
        });
        if (this.current == server) {
            if ($localStorage.servers) {
                this.current = $localStorage.servers[0];
            } else {
                this.current = null;
            }
        }
    };

    this.setCurrent = function (server) {
        this.current = server;
    };
}]);

cdbmanager.controller('serversCtrl', ["$scope", "servers", function ($scope, servers) {
    $scope.$watch(function () {
        return servers.all();
    }, function (servers) {
        $scope.servers = servers;
    });

    $scope.$watch(function () {
        return servers.current;
    }, function (server) {
        $scope.current = server;
    });

    $scope.addServer = function (server) {
        servers.add(server);
    };

    $scope.removeServer = function (server) {
        servers.remove(server);
    };

    $scope.setCurrent = function (server) {
        servers.setCurrent(server);
    };
}]);
