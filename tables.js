cdbmanager.service("tables", ["SQLClient", function (SQLClient) {
    this.api = new SQLClient();

    this.getAll = function (endpoint) {
        if (endpoint) {
            return this.api.get("SELECT * FROM information_schema.tables WHERE table_schema = '" + endpoint.account + "' ORDER BY table_schema, table_name;");
        }
    };
}]);

cdbmanager.controller('tablesCtrl', ["$scope", "tables", function ($scope, tables) {
    $scope.$watch(function () {
        return $scope.current;
    }, function (currentEndpoint) {
        return tables.getAll(currentEndpoint);
    });

    $scope.$watch(function () {
        return tables.api.items;
    }, function (table_list) {
        $scope.tables = table_list;
    });
}]);
