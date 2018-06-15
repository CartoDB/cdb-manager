api.factory('Column', ["SQLClient", function (SQLClient) {
  return function (columnFromDB) {
    angular.extend(this, columnFromDB);

    this.api = new SQLClient();
  };
}]);

cdbmanager.service("columns", ["SQLClient", "Column", function (SQLClient, Column) {
  let self = this;

  this.api = new SQLClient();

  this.get = function (table, action, error, extraQuery) {
    let _action = function () {
      if (self.api && self.api.items) {
        for (let i = 0; i < self.api.items.length; i++) {
          self.api.items[i] = new Column(self.api.items[i], self);
        }
      }

      if (action) {
        action();
      }
    };

    let query = "select attname, format_type(atttypid, atttypmod) as type from pg_attribute where attrelid = " + table._oid + " and attisdropped = false and attnum > 0 order by attnum";

    if (extraQuery) {
      query += " " + extraQuery;
    }

    self.api.send(query, _action, error);
  };
}]);
