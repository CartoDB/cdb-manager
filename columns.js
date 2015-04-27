api.factory('Column', ["SQLClient", function (SQLClient) {
    return function (columnFromDB) {
        angular.extend(this, columnFromDB);

        this.api = new SQLClient();
    }
}]);

cdbmanager.service("columns", ["SQLClient", "Column", function (SQLClient, Column) {
    var self = this;

    this.api = new SQLClient();

    this.get = function (table, action, error, extraQuery) {
        var _action = function () {
            for (var i = 0; i < self.api.items.length; i++) {
                self.api.items[i] = new Column(self.api.items[i], self);
            }

            if (action) {
                action();
            }
        };

        var query = "select attname, format_type(atttypid, atttypmod) as type from pg_attribute where attrelid = " + table._oid + " and attisdropped = false and attnum > 0";

        if (extraQuery) {
            query += " " + extraQuery;
        }

        self.api.send(query, _action, error);
    };
}]);
