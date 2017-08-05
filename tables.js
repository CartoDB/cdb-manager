api.factory('Table', ["SQLClient", "columns", "constraints", "indexes", "records", "triggers", function (SQLClient, columns, constraints, indexes, records, triggers) {
    return function (tableFromDB) {
        var self = this;

        angular.extend(this, tableFromDB);

        this.api = new SQLClient();

        this.columns = null;
        this.constraints = null;
        this.indexes = null;
        this.records = null;
        this.triggers = null;

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

        this.getRecords = function (limit, offset, action, error, extraQuery) {
            var _action = function () {
                self.records = records.api.items;

                if (action) {
                    action();
                }
            };

            records.get(self, limit, offset, _action, error, extraQuery);
        };

        this.orderRecords = function (parameter, limit) {
            if (self.orders.records == "asc") {
                self.orders.records = "desc";
                self.getRecords(limit, 0, null, null, "order by " + parameter + " desc");
            } else {
                self.orders.records = "asc";
                self.getRecords(limit, 0, null, null, "order by " + parameter);
            }
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
    };
}]);

cdbmanager.service("tables", ["SQLClient", "Table", "settings", function (SQLClient, Table, settings) {
    var self = this;

    this.api = new SQLClient();

    this.current = null;

    var order = null;

    this.get = function (action, error, extraQuery) {
        var query;

        if (settings.showAnalysisTables) {
            query = "select pg_class.oid as _oid, pg_class.relname, pg_class.reltuples, pg_namespace.nspname from pg_class, pg_roles, pg_namespace where pg_roles.oid = pg_class.relowner and pg_roles.rolname = current_user and pg_namespace.oid = pg_class.relnamespace and pg_class.relkind = 'r'";
        } else {
            query = "select pg_class.oid as _oid, pg_class.relname, pg_class.reltuples, pg_namespace.nspname from pg_class, pg_roles, pg_namespace where pg_roles.oid = pg_class.relowner and pg_roles.rolname = current_user and pg_namespace.oid = pg_class.relnamespace and pg_class.relkind = 'r' and pg_class.relname not like 'analysis_%'";
        }

        var _action = function () {
            order = null;

            if (self.api && self.api.items) {
                for (var i = 0; i < self.api.items.length; i++) {
                    self.api.items[i] = new Table(self.api.items[i], self);
                }
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

    this.order = function (parameter, pageSize, newOrder) {
        // pageSize needs to be there because it might be sent from a result table, but we don't really need it here
        if (self.api && self.api.items) {
            if (newOrder == "desc" || (!newOrder && order == "asc")) {
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
    };
}]);

cdbmanager.controller('tableSelectorCtrl', ["$scope", "tables", "endpoints", "nav", "settings", function ($scope, tables, endpoints, nav, settings) {
    $scope.nav = nav;

    $scope.currentTable = null;

    $scope.showTable = function (table) {
        tables.current = table;
    };

    $scope.refreshList = function () {
        tables.get(function () {
            tables.order("relname", null, "asc");
        });
    };

    // update table list in scope when current endpoint changes
    $scope.$watch(function () {
        return endpoints.current;
    }, function () {
        $scope.tables = $scope.refreshList();
    }, true);

    // update table list in scope when show analysis tables settings change
    $scope.$watch(function () {
        return settings.showAnalysisTables;
    }, function () {
        $scope.tables = $scope.refreshList();
    });

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
        id: "tables",
        rowsPerPage: settings.rowsPerPage,
        headers: [
            {name: 'nspname', title: 'Schema'},
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

    // update number of rows per page when settings changes
    $scope.$watch(function () {
        return settings.rowsPerPage;
    }, function () {
        $scope.cdbrt.rowsPerPage = settings.rowsPerPage;
    });

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
        id: "columns",
        rowsPerPage: settings.rowsPerPage
    };
    $scope.cdbrt4Indexes = {
        id: "indexes",
        rowsPerPage: settings.rowsPerPage
    };
    $scope.cdbrt4Triggers = {
        id: "triggers",
        rowsPerPage: settings.rowsPerPage
    };
    $scope.cdbrt4Constraints = {
        id: "constraints",
        rowsPerPage: settings.rowsPerPage
    };
    $scope.cdbrt4Records = {
        id: "records",
        rowsPerPage: settings.rowsPerPage,
        async: function (limit, offset) {
            if ($scope.currentTable) {
                $scope.currentTable.getRecords(limit, offset);
            }
        }
    };

    // update number of rows per page when settings changes
    $scope.$watch(function () {
        return settings.rowsPerPage;
    }, function () {
        $scope.cdbrt4Columns.rowsPerPage = settings.rowsPerPage;
        $scope.cdbrt4Indexes.rowsPerPage = settings.rowsPerPage;
        $scope.cdbrt4Triggers.rowsPerPage = settings.rowsPerPage;
        $scope.cdbrt4Constraints.rowsPerPage = settings.rowsPerPage;
        $scope.cdbrt4Records.rowsPerPage = settings.rowsPerPage;
    });

    // update current table pointer in scope when a new table is selected
    $scope.$watch(function () {
        return tables.current;
    }, function (currentTable) {
        $scope.currentTable = currentTable;
        if ($scope.currentTable) {
            nav.setCurrentView("table.columns");
            $scope.currentTable.getColumns();

            $scope.pagination = {
                current: 1
            };

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
        $scope.pagination = {
            current: 1
        };

        if (nav.isCurrentView("table.columns")) {
            $scope.currentTable.getColumns();
        } else if (nav.isCurrentView("table.indexes")) {
            $scope.currentTable.getIndexes();
        } else if (nav.isCurrentView("table.records")) {
            $scope.currentTable.getRecords($scope.cdbrt4Records.rowsPerPage);
        } else if (nav.isCurrentView("table.constraints")) {
            $scope.currentTable.getConstraints();
        } else if (nav.isCurrentView("table.triggers")) {
            $scope.currentTable.getTriggers();
        }
    });
}]);
