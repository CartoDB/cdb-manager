api.factory('Table', ["SQLClient", "columns", "constraints", "indexes", "records", "triggers", function (SQLClient, columns, constraints, indexes, records, triggers) {
    return function (tableFromDB) {
        angular.extend(this, tableFromDB);

        this.api = new SQLClient();

        this.columns = null;
        this.constraints = null;
        this.indexes = null;
        this.records = null;
        this.triggers = null;

        var self = this;

        this.orders = {};

        this.orderByJS = function (items, parameter, orderName) {
            if (self.orders[orderName] == "asc") {
                self.orders[orderName] = "desc";
                items.sort(function (a, b) {
                    if (a[parameter] > b[parameter]) return -1;
                    if (a[parameter] < b[parameter]) return 1;
                    return 0;
                });
            } else {
                self.orders[orderName] = "asc";
                items.sort(function (a, b) {
                    if (a[parameter] < b[parameter]) return -1;
                    if (a[parameter] > b[parameter]) return 1;
                    return 0;
                });
            }
        };

        this.getColumns = function (action, error) {
            var _action = function () {
                self.columns = columns.api.items;

                if (action) {
                    action();
                }
            };

            columns.get(self, _action, error);
        };

        this.orderColumns = function (parameter) {
            self.orderByJS(self.columns, parameter, "columns");
        };

        this.getConstraints = function (action, error) {
            var _action = function () {
                self.constraints = constraints.api.items;

                if (action) {
                    action();
                }
            };

            constraints.get(self, _action, error);
        };

        this.orderConstraints = function (parameter) {
            self.orderByJS(self.constraints, parameter, "constraints");
        };

        this.getIndexes = function (action, error) {
            var _action = function () {
                self.indexes = indexes.api.items;

                if (action) {
                    action();
                }
            };

            indexes.get(self, _action, error);
        };

        this.orderIndexes = function (parameter) {
            self.orderByJS(self.indexes, parameter, "indexes");
        };

        this.getRecords = function (action, error) {
            var _action = function () {
                self.records = records.api.items;

                if (action) {
                    action();
                }
            };

            records.get(self, _action, error);
        };

        this.orderRecords = function (parameter, action, error) {
            var _action = function () {
                self.records = records.api.items;

                if (action) {
                    action();
                }
            };

            var extraQuery;

            if (self.orders["records"] == "asc") {
                self.orders["records"] = "desc";
                extraQuery = "order by " + parameter + " desc";
            } else {
                self.orders["records"] = "asc";
                extraQuery = "order by " + parameter;
            }

            records.get(self, _action, error, extraQuery);
        };

        this.getTriggers = function (action, error) {
            var _action = function () {
                self.triggers = triggers.api.items;

                if (action) {
                    action();
                }
            };

            triggers.get(self, _action, error);
        };

        this.orderTriggers = function (parameter) {
            self.orderByJS(self.triggers, parameter, "triggers");
        };
    }
}]);

cdbmanager.service("tables", ["SQLClient", "Table", function (SQLClient, Table) {
    var self = this;

    this.api = new SQLClient();

    this.current = null;

    var order = null;

    this.get = function (action, error, extraQuery) {
        var query = "select pg_class.oid as _oid, pg_class.relname, pg_class.reltuples from pg_class, pg_roles where pg_roles.oid = pg_class.relowner and pg_roles.rolname = current_user and pg_class.relkind = 'r'";

        var _action = function () {
            order = null;

            for (var i = 0; i < self.api.items.length; i++) {
                self.api.items[i] = new Table(self.api.items[i], self);
            }

            if (action) {
                action();
            }
        };

        if (extraQuery) {
            query += " " + extraQuery;
        }

        self.api.send(query, _action, error);
    };

    this.order = function (parameter) {
        if (self.api && self.api.items) {
            if (order == "asc") {
                order = "desc";
                self.api.items.sort(function (a, b) {
                    if (a[parameter] > b[parameter]) return -1;
                    if (a[parameter] < b[parameter]) return 1;
                    return 0;
                });
            } else {
                order = "asc";
                self.api.items.sort(function (a, b) {
                    if (a[parameter] < b[parameter]) return -1;
                    if (a[parameter] > b[parameter]) return 1;
                    return 0;
                });
            }
        }
    }
}]);

cdbmanager.controller('tableSelectorCtrl', ["$scope", "tables", "endpoints", "nav", function ($scope, tables, endpoints, nav) {
    $scope.nav = nav;

    $scope.currentTable = null;

    $scope.showTable = function (table) {
        tables.current = table;
    };

    $scope.refreshList = function () {
        tables.order("relname");
    };

    // update table list in scope when current endpoint changes
    $scope.$watch(function () {
        return endpoints.current;
    }, function () {
        $scope.tables = tables.order("relname");
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
        headers: [
            {name: 'relname', title: 'Name'},
            {name: 'reltuples', title: 'Estimated row count'}
        ],
        skip: ["columns", "constraints", "triggers", "records", "indexes", "orders"],
        actions: [
            {
                text: "Details",
                onClick: function (table) {
                    nav.setCurrentView("table.columns");
                    tables.current = table;
                }
            }
        ],
        orderBy: tables.order
    };

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

cdbmanager.controller('tableCtrl', ["$scope", "nav", "tables", "columns", "indexes", "triggers", "constraints", "records", "endpoints", "settings", function ($scope, nav, tables, columns, indexes, triggers, constraints, records, endpoints, settings) {
    $scope.nav = nav;

    $scope.currentTable = null;

    // Settings for the result tables
    $scope.cdbrt4Columns = {
        rowsPerPage: settings.sqlConsoleRowsPerPage
    };
    $scope.cdbrt4Indexes = {
        rowsPerPage: settings.sqlConsoleRowsPerPage
    };
    $scope.cdbrt4Triggers = {
        rowsPerPage: settings.sqlConsoleRowsPerPage
    };
    $scope.cdbrt4Constraints = {
        rowsPerPage: settings.sqlConsoleRowsPerPage
    };
    $scope.cdbrt4Records = {
        rowsPerPage: settings.sqlConsoleRowsPerPage
    };

    // update current table pointer in scope when a new table is selected
    $scope.$watch(function () {
        return tables.current;
    }, function (currentTable) {
        $scope.currentTable = currentTable;
        if ($scope.currentTable) {
            nav.setCurrentView("table.columns");
            $scope.currentTable.getColumns();

            // Update settings for the result tables
            $scope.cdbrt4Columns.orderBy = currentTable.orderColumns;
            $scope.cdbrt4Indexes.orderBy = currentTable.orderIndexes;
            $scope.cdbrt4Triggers.orderBy = currentTable.orderTriggers;
            $scope.cdbrt4Constraints.orderBy = currentTable.orderConstraints;
            $scope.cdbrt4Records.orderBy = currentTable.orderRecords;
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
