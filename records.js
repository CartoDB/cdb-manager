api.factory('Record', ["SQLClient", function (SQLClient) {
    return function (recordFromDB) {
        angular.extend(this, recordFromDB);

        this.api = new SQLClient();
    }
}]);

cdbmanager.service("records", ["SQLClient", "Record", function (SQLClient, Record) {
    var self = this;

    this.api = new SQLClient();

    this.get = function (table, action, error, extraQuery) {
        var _action = function () {
            for (var i = 0; i < self.api.items.length; i++) {
                self.api.items[i] = new Record(self.api.items[i], self);
            }

            if (action) {
                action();
            }
        };

        var query = "select * from " + table.relname;

        if (extraQuery) {
            query += " " + extraQuery;
        }

        // Limited to 1000 records until we implement server-side pagination
        query += " limit 1000";

        self.api.send(query, _action, error);
    };
}]);
