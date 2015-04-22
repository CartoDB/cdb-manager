api.factory('Trigger', ["SQLClient", function (SQLClient) {
    return function (triggerFromDB) {
        angular.extend(this, triggerFromDB);

        this.api = new SQLClient();
    }
}]);

cdbmanager.service("triggers", ["SQLClient", "Trigger", function (SQLClient, Trigger) {
    this.api = new SQLClient();

    this.get = function (table, action, error) {
        var self = this;

        var _action = function () {
            for (var i = 0; i < self.api.items.length; i++) {
                self.api.items[i] = new Trigger(self.api.items[i], self);
            }

            if (action) {
                action();
            }
        };

        this.api.send("select * from pg_trigger where tgrelid = " + table._oid + ";", _action, error);
    };
}]);
