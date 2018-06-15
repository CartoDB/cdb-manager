api.factory('Index', ["SQLClient", function (SQLClient) {
  return function (indexFromDB) {
    angular.extend(this, indexFromDB);

    this.api = new SQLClient();
  };
}]);

cdbmanager.service("indexes", ["SQLClient", "Index", function (SQLClient, Index) {
  let self = this;

  this.api = new SQLClient();

  this.get = function (table, action, error, extraQuery) {
    let _action = function () {
      if (self.api && self.api.items) {
        for (let i = 0; i < self.api.items.length; i++) {
          self.api.items[i] = new Index(self.api.items[i], self);
        }
      }

      if (action) {
        action();
      }
    };

    let query = "SELECT " +
      "i.relname AS index_name, a.attname AS column_name, am.amname AS index_type " +
      "FROM pg_class t " +
      "JOIN pg_attribute a ON t.oid = a.attrelid " +
      "JOIN pg_index ix ON ix.indrelid = t.oid " +
      "JOIN pg_class i ON ix.indexrelid = i.oid AND a.attnum = ANY(ix.indkey) " +
      "JOIN pg_am am ON i.relam = am.oid " +
      "WHERE t.relkind = 'r' " +
      "AND t.oid = " + table._oid +
      "ORDER BY t.relname, i.relname;";

    if (extraQuery) {
      query += " " + extraQuery;
    }

    self.api.send(query, _action, error);
  };
}]);
