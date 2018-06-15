api.factory('Constraint', ["SQLClient", function (SQLClient) {
  return function (constraintFromDB) {
    angular.extend(this, constraintFromDB);

    this.api = new SQLClient();
  };
}]);

cdbmanager.service("constraints", ["SQLClient", "Constraint", function (SQLClient, Constraint) {
  let self = this;

  this.api = new SQLClient();

  this.get = function (table, action, error, extraQuery) {
    let _action = function () {
      if (self.api && self.api.items) {
        for (let i = 0; i < self.api.items.length; i++) {
          self.api.items[i] = new Constraint(self.api.items[i], self);
        }
      }

      if (action) {
        action();
      }
    };

    let query = "select * from pg_constraint where conrelid = " + table._oid;

    if (extraQuery) {
      query += " " + extraQuery;
    }

    self.api.send(query, _action, error);
  };
}]);
