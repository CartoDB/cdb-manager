cdbmanager.service("tables", ["SQLClient", function (SQLClient) {
    this.api = new SQLClient();

    this.current = null;

    this.getAll = function (endpoint) {
        if (endpoint) {
            return this.api.get("SELECT * FROM information_schema.tables WHERE table_schema = '" + endpoint.account + "' ORDER BY table_schema, table_name;");
        }
    };
}]);

cdbmanager.controller('tableSelectorCtrl', ["$scope", "tables", "endpoints", "nav", "columns", function ($scope, tables, endpoints, nav, columns) {
    $scope.nav = nav;

    $scope.showTable = function (tableName) {
        columns.getAll(tableName, endpoints.current);
        $scope.nav.current = "tables.table.columns";
        tables.current = tableName;
    };

    // update table list when current endpoint changes
    $scope.$watch(function () {
        return endpoints.current;
    }, function (currentEndpoint) {
        $scope.tables = tables.getAll(currentEndpoint);
    }, true);
    $scope.$watch(function () {
        return tables.api.items;
    }, function (table_list) {
        $scope.tables = table_list;
    });
}]);

cdbmanager.controller('tablesCtrl', ["$scope", "tables", "endpoints", "nav", function ($scope, tables, endpoints, nav) {
    $scope.nav = nav;

    // update table list when current endpoint changes
    $scope.$watch(function () {
        return endpoints.current;
    }, function (currentEndpoint) {
        $scope.tables = tables.getAll(currentEndpoint);
    }, true);
    $scope.$watch(function () {
        return tables.api.items;
    }, function (table_list) {
        $scope.tables = table_list;
    });
}]);

// TBD
cdbmanager.controller('tableCtrl', ["$scope", "nav", "columns", "tables", "endpoints", "indexes", function ($scope, nav, columns, tables, endpoints, indexes) {
    $scope.nav = nav;

    //
    $scope.$watch(function () {
        return columns.api.items;
    }, function (columns) {
        $scope.columns = columns;
    });

    //
    $scope.$watch(function () {
        return indexes.api.items;
    }, function (indexes) {
        $scope.indexes = indexes;
    });

    $scope.$watch(function () {
        return nav.current;
    }, function (section) {
        console.log("LL", section);
        if (section == "tables.table.columns") {
            $scope.columns = columns.getAll(tables.current, endpoints.current);
        } else if (section == "tables.table.indexes") {
            $scope.columns = indexes.getAll(tables.current);
        }
    });
}]);
