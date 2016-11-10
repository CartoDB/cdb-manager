// saves endpoints to local storage
cdbmanager.service('endpoints', ["$localStorage", function ($localStorage) {
    var self = this;

    $localStorage.endpoints = $localStorage.endpoints || [];

    if ($localStorage.endpoints) {
        this.current = $localStorage.endpoints[0];
    } else {
        this.current = null;
    }

    this.all = function () {
        return $localStorage.endpoints;
    };

    this.add = function (endpoint) {
        $localStorage.endpoints.push(angular.copy(endpoint));
        self.current = $localStorage.endpoints[$localStorage.endpoints.length - 1];
    };

    this.update = function (endpoint, properties) {
        for (var propertyName in properties) {
            if (properties.hasOwnProperty(propertyName)) {
                endpoint[propertyName] = properties[propertyName];
            }
        }
    };

    this.remove = function (endpoint) {
        $localStorage.endpoints = $localStorage.endpoints.filter(function (_endpoint) {
            return endpoint != _endpoint;
        });

        if (self.current == endpoint) {
            if ($localStorage.endpoints) {
                self.current = $localStorage.endpoints[0];
            } else {
                self.current = null;
            }
        }
    };

    this.setCurrent = function (endpoint) {
        self.current = endpoint;
    };
}]);

cdbmanager.controller('endpointsCtrl', ["$scope", "endpoints", "alerts", function ($scope, endpoints, alerts) {
    $scope.updatedEndpoint = {};

    // keep the endpoint list in the scope always updated
    $scope.$watch(function () {
        return endpoints.all();
    }, function (endpoints) {
        $scope.endpoints = endpoints;
    });

    // keep the current endpoint and form in the scope always updated
    $scope.$watch(function () {
        return endpoints.current;
    }, function (endpoint) {
        alerts.close();
        $scope.current = endpoint;
        $scope.updatedEndpoint = angular.copy($scope.current);
    });

    $scope.addEndpoint = function () {
        endpoints.add({
            name: "New"
        });
    };

    $scope.$watch("updatedEndpoint.account", function (accountName) {
        if (accountName) {
            $scope.updatedEndpoint.sqlURL = "https://" + accountName + ".carto.com/api/v2/sql";
            $scope.updatedEndpoint.mapsURL = "https://" + accountName + ".carto.com/api/v2/map";
        } else {
            $scope.updatedEndpoint.sqlURL = "";
            $scope.updatedEndpoint.mapsURL = "";
        }
    });

    $scope.removeCurrentEndpoint = function () {
        endpoints.remove($scope.current);
    };

    $scope.updateCurrentEndpoint = function (updatedEndpoint) {
        endpoints.update($scope.current, updatedEndpoint);
    };

    $scope.setCurrent = function () {
        endpoints.setCurrent($scope.current);
    };
}]);
