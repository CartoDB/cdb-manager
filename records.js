api.factory('Record', ["SQLClient", function (SQLClient) {
    return function (recordFromDB) {
        angular.extend(this, recordFromDB);

        this.api = new SQLClient();
    }
}]);

cdbmanager.service("records", ["SQLClient", "Record", function (SQLClient, Record) {
    this.api = new SQLClient();

    this.get = function (table, action, error) {
        var self = this;

        var _action = function () {
            for (var i = 0; i < self.api.items.length; i++) {
                self.api.items[i] = new Record(self.api.items[i], self);
            }

            if (action) {
                action();
            }
        };

        this.api.send("select * from " + table.relname + ";", _action, error);
    };
}]);
