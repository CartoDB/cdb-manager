api.factory('Sequence', ["SQLClient", function (SQLClient) {
    return function (sequenceFromDB) {
        angular.extend(this, sequenceFromDB);
    };
}]);

cdbmanager.service("sequences", ["SQLClient", "Sequence", function (SQLClient, Sequence) {
    var self = this;

    this.api = new SQLClient();
    this.tmp_api = new SQLClient();

    var getSequenceDetails = function (results) {
        self.api.items.push(new Sequence(results.data.rows[0]));
    };

    this.get = function (action, error, extraQuery) {
        var _action = function () {
            if (self.api && self.api.items) {
                var itemsCopy = angular.copy(self.api.items);
                self.api.items = [];
                for (var i = 0; i < itemsCopy.length; i++) {
                    var query = "select * from " + itemsCopy[i].relname;
                    self.tmp_api.send(query, getSequenceDetails);
                }
            }

            if (action) {
                action();
            }
        };

        var query = "select pg_class.relname from pg_class, pg_roles, pg_namespace where pg_roles.oid = pg_class.relowner and pg_roles.rolname = current_user and pg_namespace.oid = pg_class.relnamespace and pg_class.relkind = 'S'";

        if (extraQuery) {
            query += " " + extraQuery;
        }

        self.api.send(query, _action, error);
    };

    this.orderName = "desc";

    this.order = function (parameter, orderName) {
        if (self.orderName == "asc") {
            self.orderName = "desc";
            self.api.items.sort(function (a, b) {
                if (a[parameter] > b[parameter]) return -1;
                if (a[parameter] < b[parameter]) return 1;
                return 0;
            });
        } else {
            self.orderName = "asc";
            self.api.items.sort(function (a, b) {
                if (a[parameter] < b[parameter]) return -1;
                if (a[parameter] > b[parameter]) return 1;
                return 0;
            });
        }
    };
}]);

cdbmanager.controller('sequenceSelectorCtrl', ["$scope", "sequences", "endpoints", "nav", function ($scope, sequences, endpoints, nav) {
    $scope.nav = nav;

    $scope.refreshList = function () {
        sequences.get();
    };

    // update sequence list in scope when current endpoint changes
    $scope.$watch(function () {
        return endpoints.current;
    }, function () {
        $scope.sequences = $scope.refreshList();
    }, true);

    // update sequence list in scope when actual sequence list changes
    $scope.$watch(function () {
        return sequences.api.items;
    }, function (sequenceList) {
        $scope.sequences = sequenceList;
    });
}]);

cdbmanager.controller('sequenceCtrl', ["$scope", "nav", "sequences", "columns", "indexes", "triggers", "constraints", "records", "endpoints", "settings", function ($scope, nav, sequences, columns, indexes, triggers, constraints, records, endpoints, settings) {
    $scope.nav = nav;

    // Settings for the result tables
    $scope.cdbrt = {
        id: "sequences",
        rowsPerPage: settings.sqlConsoleRowsPerPage,
        orderBy: sequences.order
    };

    // update sequence list in scope when actual sequence list changes
    $scope.$watch(function () {
        return sequences.api.items;
    }, function (sequenceList) {
        $scope.sequences = sequenceList;
    });
}]);
