cdbmanager.service("indexes", ["SQLClient", function (SQLClient) {
    this.api = new SQLClient();

    this.getAll = function (table) {
        var query = "SELECT " +
                    "i.relname AS index_name, a.attname AS column_name, am.amname AS index_type " +
                    "FROM pg_class t " +
                    "JOIN pg_attribute a ON t.oid = a.attrelid " +
                    "JOIN pg_index ix ON ix.indrelid = t.oid " +
                    "JOIN pg_class i ON ix.indexrelid = i.oid AND a.attnum = ANY(ix.indkey) " +
                    "JOIN pg_am am ON i.relam = am.oid " +
                    "WHERE t.relkind = 'r' " +
                    "AND t.oid = " + table._oid +
                    "ORDER BY t.relname, i.relname;";

        return this.api.send(query);
    };
}]);
