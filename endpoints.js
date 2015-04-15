// saves endpoints to local storage
cdbmanager.service('endpoints', ["$localStorage", function ($localStorage) {
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
        this.current = $localStorage.endpoints[$localStorage.endpoints.length - 1];
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

        if (this.current == endpoint) {
            if ($localStorage.endpoints) {
                this.current = $localStorage.endpoints[0];
            } else {
                this.current = null;
            }
        }
    };

    this.setCurrent = function (endpoint) {
        this.current = endpoint;
    };
}]);

cdbmanager.controller('endpointsCtrl', ["$scope", "endpoints", function ($scope, endpoints) {
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
        $scope.current = endpoint;
        $scope.updatedEndpoint = angular.copy($scope.current);
    });

    $scope.addEndpoint = function () {
        endpoints.add({
            name: "New",
            url: "",
            apiKey: ""
        });
    };

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
