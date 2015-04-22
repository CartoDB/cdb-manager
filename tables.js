api.factory('Table', ["SQLClient", "columns", "constraints", "indexes", "records", "triggers", function (SQLClient, columns, constraints, indexes, records, triggers) {
    return function (tableFromDB) {
        angular.extend(this, tableFromDB);

        this.api = new SQLClient();

        this.columns = null;
        this.constraints = null;
        this.indexes = null;
        this.records = null;
        this.triggers = null;

        this.getColumns = function (action, error) {
            var self = this;

            var _action = function () {
                self.columns = columns.api.items;

                if (action) {
                    action();
                }
            };

            columns.get(this, _action, error);
        };

        this.getConstraints = function (action, error) {
            var self = this;

            var _action = function () {
                self.constraints = constraints.api.items;

                if (action) {
                    action();
                }
            };

            constraints.get(this, _action, error);
        };

        this.getIndexes = function (action, error) {
            var self = this;

            var _action = function () {
                self.indexes = indexes.api.items;

                if (action) {
                    action();
                }
            };

            indexes.get(this, _action, error);
        };

        this.getRecords = function (action, error) {
            var self = this;

            var _action = function () {
                self.records = records.api.items;

                if (action) {
                    action();
                }
            };

            records.get(this, _action, error);
        };

        this.getTriggers = function (action, error) {
            var self = this;

            var _action = function () {
                self.triggers = triggers.api.items;

                if (action) {
                    action();
                }
            };

            triggers.get(this, _action, error);
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

cdbmanager.controller('tableSelectorCtrl', ["$scope", "tables", "endpoints", "nav", function ($scope, tables, endpoints, nav) {
    $scope.nav = nav;

    $scope.currentTable = null;

    $scope.showTable = function (table) {
        tables.current = table;
    };

    $scope.refreshList = function () {
        tables.get();
    };

    // update table list in scope when current endpoint changes
    $scope.$watch(function () {
        return endpoints.current;
    }, function () {
        $scope.tables = tables.get();
    }, true);

    // update table list in scope when actual table list changes
    $scope.$watch(function () {
        return tables.api.items;
    }, function (tableList) {
        $scope.tables = tableList;
    });

    // update current table pointer in scope when a new table is selected
    $scope.$watch(function () {
        return tables.current;
    }, function (currentTable) {
        $scope.currentTable = currentTable;
    });
}]);

cdbmanager.controller('tablesCtrl', ["$scope", "tables", "endpoints", "nav", "settings", function ($scope, tables, endpoints, nav, settings) {
    $scope.nav = nav;

    // Config result table
    $scope.cdbrt = {
        rowsPerPage: settings.sqlConsoleRowsPerPage,
        skip: ["columns", "indexes", "triggers", "records", "constraints"]
    };
    $scope.headers = ['Name', 'Estimated row count'];
    $scope.actions = [
        {
            text: "Details",
            onClick: function (table) {
                nav.setCurrentView("table.columns");
                tables.current = table;
            }
        }
    ];

    // update table list in scope when current endpoint changes
    $scope.$watch(function () {
        return endpoints.current;
    }, function () {
        tables.get();
    }, true);

    // update table list in scope when actual table list changes
    $scope.$watch(function () {
        return tables.api.items;
    }, function (tableList) {
        $scope.tables = tableList;
    });
}]);

cdbmanager.controller('tableCtrl', ["$scope", "nav", "tables", "endpoints", "settings", function ($scope, nav, tables, endpoints, settings) {
    $scope.nav = nav;

    $scope.currentTable = null;

    // Settings for the result tables
    $scope.cdbrt = {
        rowsPerPage: settings.rowsPerPage
    };

    // update current table pointer in scope when a new table is selected
    $scope.$watch(function () {
        return tables.current;
    }, function (currentTable) {
        $scope.currentTable = currentTable;
        if ($scope.currentTable) {
            nav.setCurrentView("table.columns");
            $scope.currentTable.getColumns();
        }
    });

    // Synchronize columns in scope with actual columns
    $scope.$watch(function () {
        return $scope.currentTable ? $scope.currentTable.columns : null;
    }, function (columns) {
        $scope.columns = columns;
    });

    // Synchronize constraints in scope with actual constraints
    $scope.$watch(function () {
        return $scope.currentTable ? $scope.currentTable.constraints : null;
    }, function (constraints) {
        $scope.constraints = constraints;
    });

    // Synchronize triggers in scope with actual triggers
    $scope.$watch(function () {
        return $scope.currentTable ? $scope.currentTable.triggers : null;
    }, function (triggers) {
        $scope.triggers = triggers;
    });

    // Synchronize records in scope with actual records
    $scope.$watch(function () {
        return $scope.currentTable ? $scope.currentTable.records : null;
    }, function (records) {
        $scope.records = records;
    });

    // Synchronize indexes in scope with actual indexes
    $scope.$watch(function () {
        return $scope.currentTable ? $scope.currentTable.indexes : null;
    }, function (indexes) {
        $scope.indexes = indexes;
    });

    // Force data refresh when a tab is selected
    $scope.$watch(function () {
        return nav.current;
    }, function () {
        if (nav.isCurrentView("table.columns")) {
            $scope.currentTable.getColumns();
        } else if (nav.isCurrentView("table.indexes")) {
            $scope.currentTable.getIndexes();
        } else if (nav.isCurrentView("table.records")) {
            $scope.currentTable.getRecords();
        } else if (nav.isCurrentView("table.constraints")) {
            $scope.currentTable.getConstraints();
        } else if (nav.isCurrentView("table.triggers")) {
            $scope.currentTable.getTriggers();
        }
    });
}]);
