cdbmanager.service("tables", ["SQLClient", function (SQLClient) {
    this.api = new SQLClient();

    this.current = null;

    this.getAll = function (endpoint) {
        if (endpoint) {
            return this.api.get("SELECT relname, reltuples FROM pg_class, pg_namespace where relnamespace = pg_namespace.oid and pg_namespace.nspname = '" + endpoint.account + "' and relkind = 'r';");
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

cdbmanager.controller('tablesCtrl', ["$scope", "tables", "endpoints", "nav", "columns", function ($scope, tables, endpoints, nav, columns) {
    $scope.nav = nav;
    $scope.headers = ['Name', 'Estimated row count'];
    $scope.actions = [
        {
            text: "Details",
            onClick: function (tableName) {
                columns.getAll(tableName, endpoints.current);
                $scope.nav.current = "tables.table.columns";
                tables.current = tableName;
            },
            idField: "relname"
        },
        {
            text: "Drop",
            onClick: function (tableName) {
                // TBD
            },
            idField: "relname"
        }
    ];

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
cdbmanager.controller('tableCtrl', ["$scope", "nav", "columns", "tables", "endpoints", "indexes", "settings", function ($scope, nav, columns, tables, endpoints, indexes, settings) {
    $scope.nav = nav;
    $scope.cdbrt = {  // Settings for the tables (same settings for all of them for now)
        rowsPerPage: settings.rowsPerPage
    };

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
        if (section == "tables.table.columns") {
            $scope.columns = columns.getAll(tables.current, endpoints.current);
        } else if (section == "tables.table.indexes") {
            $scope.columns = indexes.getAll(tables.current);
        }
    });
}]);
