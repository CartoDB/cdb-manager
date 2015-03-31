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
        $localStorage.endpoints.push(endpoint);
        this.current = endpoint;
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
    $scope.$watch(function () {
        return endpoints.all();
    }, function (endpoints) {
        $scope.endpoints = endpoints;
    });

    $scope.$watch(function () {
        return endpoints.current;
    }, function (endpoint) {
        $scope.current = endpoint;
        $scope.activePanel = 'table';
    });

    $scope.addEndpoint = function () {
        endpoints.add({
            name: "New",
            url: "",
            account: "",
            apiKey: ""
        });
    };

    $scope.removeEndpoint = function (endpoint) {
        endpoints.remove(endpoint);
    };

    $scope.setCurrent = function () {
        endpoints.setCurrent($scope.current);
    };
}]);
