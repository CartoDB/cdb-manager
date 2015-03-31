cdbmanager.service("tables", ["SQLClient", function (SQLClient) {
    this.api = new SQLClient();

    this.getAll = function (endpoint) {
        if (endpoint) {
            return this.api.get("SELECT * FROM information_schema.tables WHERE table_schema = '" + endpoint.account + "' ORDER BY table_schema, table_name;");
        }
    };
}]);

cdbmanager.controller('tableSelectorCtrl', ["$scope", "tables", "endpoints", "nav", function ($scope, tables, endpoints, nav) {
    $scope.nav = nav;

    $scope.$watch(function () {
        return endpoints.current;
    }, function (currentEndpoint) {
        return tables.getAll(currentEndpoint);
    });

    $scope.$watch(function () {
        return tables.api.items;
    }, function (table_list) {
        $scope.tables = table_list;
    });
}]);

cdbmanager.controller('tablesCtrl', ["$scope", "tables", "endpoints", "nav", function ($scope, tables, endpoints, nav) {
    $scope.nav = nav;

    $scope.$watch(function () {
        return endpoints.current;
    }, function (currentEndpoint) {
        return tables.getAll(currentEndpoint);
    });

    $scope.$watch(function () {
        return tables.api.items;
    }, function (table_list) {
        $scope.tables = table_list;
    });
}]);

cdbmanager.controller('tableCtrl', ["$scope", "nav", function ($scope, nav) {
    $scope.nav = nav;
}]);
