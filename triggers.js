api.factory('Trigger', ["SQLClient", function (SQLClient) {
    return function (triggerFromDB) {
        angular.extend(this, triggerFromDB);

        this.api = new SQLClient();
    }
}]);

cdbmanager.service("triggers", ["SQLClient", "Trigger", function (SQLClient, Trigger) {
    var self = this;

    this.api = new SQLClient();

    this.get = function (table, action, error, extraQuery) {
        var _action = function () {
            if (self.api && self.api.items) {
                for (var i = 0; i < self.api.items.length; i++) {
                    self.api.items[i] = new Trigger(self.api.items[i], self);
                }
            }

            if (action) {
                action();
            }
        };

        var query = "select * from pg_trigger where tgrelid = " + table._oid;

        if (extraQuery) {
            query += " " + extraQuery;
        }

        self.api.send(query, _action, error);
    };
}]);
