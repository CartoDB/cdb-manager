api.factory('Column', ["SQLClient", function (SQLClient) {
    return function (columnFromDB) {
        angular.extend(this, columnFromDB);

        this.api = new SQLClient();
    }
}]);

cdbmanager.service("columns", ["SQLClient", "Column", function (SQLClient, Column) {
    this.api = new SQLClient();

    this.get = function (table, action, error) {
        var self = this;

        var _action = function () {
            for (var i = 0; i < self.api.items.length; i++) {
                self.api.items[i] = new Column(self.api.items[i], self);
            }

            if (action) {
                action();
            }
        };

        this.api.send("select attname, format_type(atttypid, atttypmod) as type from pg_attribute where attrelid = " + table._oid + " and attisdropped = false and attnum > 0;", _action, error);
    };
}]);
