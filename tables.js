api.factory('Table', ["SQLClient", "columns", "constraints", "indexes", "records", "triggers", function (SQLClient, columns, constraints, indexes, records, triggers) {
    return function (tableFromDB) {
        angular.extend(this, tableFromDB);

        this.api = new SQLClient();

        this.getColumns = function (action, error) {
            columns.get(this, action, error);
        };

        this.getConstraints = function (action, error) {
            constraints.get(this, action, error);
        };

        this.getIndexes = function (action, error) {
            indexes.get(this, action, error);
        };

        this.getRecords = function (action, error) {
            records.get(this, action, error);
        };

        this.getTriggers = function (action, error) {
            triggers.get(this, action, error);
        };
    }
}]);

cdbmanager.service("tables", ["SQLClient", "Table", function (SQLClient, Table) {
    this.api = new SQLClient();

    this.current = null;

    this.get = function (action, error) {
        var self = this;

        var _action = function () {
            for (var i = 0; i < self.api.items.length; i++) {
                self.api.items[i] = new Table(self.api.items[i], self);
            }

            if (action) {
                action();
            }
        };

        this.api.send("select pg_class.oid as _oid, pg_class.relname, pg_class.reltuples from pg_class, pg_roles where pg_roles.oid = pg_class.relowner and pg_roles.rolname = current_user and pg_class.relkind = 'r';", _action, error);
    };
}]);

cdbmanager.controller('tableSelectorCtrl', ["$scope", "tables", "endpoints", "nav", "columns", function ($scope, tables, endpoints, nav, columns) {
    $scope.nav = nav;

    $scope.showTable = function (table) {
        columns.get(table);
        nav.setCurrentView("table.columns");
        tables.current = table;
    };

    // update table list when current endpoint changes
    $scope.$watch(function () {
        return endpoints.current;
    }, function () {
        $scope.tables = tables.get();
    }, true);
    $scope.$watch(function () {
        return tables.api.items;
    }, function (table_list) {
        $scope.tables = table_list;
    });

    // Watch current table
    $scope.$watch(function () {
        return tables.current;
    }, function (currentTable) {
        $scope.currentTable = currentTable;
    });
}]);

cdbmanager.controller('tablesCtrl', ["$scope", "tables", "endpoints", "nav", "columns", "settings", function ($scope, tables, endpoints, nav, columns, settings) {
    $scope.nav = nav;

    $scope.cdbrt = {
        rowsPerPage: settings.sqlConsoleRowsPerPage
    };
    $scope.headers = ['Name', 'Estimated row count'];
    $scope.actions = [
        {
            text: "Details",
            onClick: function (table) {
                columns.get(table);
                nav.setCurrentView("table.columns");
                tables.current = table;
            }
        }
    ];

    // update table list when current endpoint changes
    $scope.$watch(function () {
        return endpoints.current;
    }, function () {
        $scope.tables = tables.get();
    }, true);
    $scope.$watch(function () {
        return tables.api.items;
    }, function (table_list) {
        $scope.tables = table_list;
    });
}]);

// TBD
cdbmanager.controller('tableCtrl', ["$scope", "nav", "columns", "tables", "endpoints", "indexes", "records", "constraints", "triggers", "settings", function ($scope, nav, columns, tables, endpoints, indexes, records, constraints, triggers, settings) {
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
        return constraints.api.items;
    }, function (constraints) {
        $scope.constraints = constraints;
    });

    //
    $scope.$watch(function () {
        return triggers.api.items;
    }, function (triggers) {
        $scope.triggers = triggers;
    });

    //
    $scope.$watch(function () {
        return records.api.items;
    }, function (records) {
        $scope.records = records;
    });

    //
    $scope.$watch(function () {
        return indexes.api.items;
    }, function (indexes) {
        $scope.indexes = indexes;
    });

    $scope.$watch(function () {
        return nav.current;
    }, function () {
        if (nav.isCurrentView("table.columns")) {
            $scope.columns = tables.current.getColumns();
        } else if (nav.isCurrentView("table.indexes")) {
            $scope.columns = tables.current.getIndexes();
        } else if (nav.isCurrentView("table.records")) {
            $scope.columns = tables.current.getRecords();
        } else if (nav.isCurrentView("table.constraints")) {
            $scope.constraints = tables.current.getConstraints();
        } else if (nav.isCurrentView("table.triggers")) {
            $scope.triggers = tables.current.getTriggers();
        }
    });
}]);
