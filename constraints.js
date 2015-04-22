api.factory('Constraint', ["SQLClient", function (SQLClient) {
    return function (constraintFromDB) {
        angular.extend(this, constraintFromDB);

        this.api = new SQLClient();
    }
}]);

cdbmanager.service("constraints", ["SQLClient", "Constraint", function (SQLClient, Constraint) {
    this.api = new SQLClient();

    this.get = function (table, action, error) {
        var self = this;

        var _action = function () {
            for (var i = 0; i < self.api.items.length; i++) {
                self.api.items[i] = new Constraint(self.api.items[i], self);
            }

            if (action) {
                action();
            }
        };

        this.api.send("select * from pg_constraint where conrelid = " + table._oid + ";", _action, error);
    };
}]);
