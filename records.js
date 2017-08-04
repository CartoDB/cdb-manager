api.factory('Record', ["SQLClient", function (SQLClient) {
    return function (recordFromDB) {
        angular.extend(this, recordFromDB);

        this.api = new SQLClient();
    };
}]);

cdbmanager.service("records", ["SQLClient", "Record", function (SQLClient, Record) {
    var self = this;

    this.api = new SQLClient();

    this.get = function (table, limit, offset, action, error, extraQuery) {
        var _action = function () {
            if (self.api && self.api.items) {
                for (var i = 0; i < self.api.items.length; i++) {
                    self.api.items[i] = new Record(self.api.items[i], self);
                }

                if (action) {
                    action();
                }
            }
        };

        var query = "select *, count (*) over () as total_rows from " + table.relname;

        if (extraQuery) {
            query += " " + extraQuery;
        }

        if (limit) {
            query += " limit " + limit;
        }

        if (offset) {
            query += " offset " + offset;
        }

        self.api.send(query, _action, error);
    };
}]);
