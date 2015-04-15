cdbmanager.service("indexes", ["SQLClient", function (SQLClient) {
    this.api = new SQLClient();

    this.getAll = function (tableOID) {
        var query = "SELECT i.relname as index_name, a.attname as column_name from pg_class t, pg_class i, ";
        query += "pg_index ix, pg_attribute a where t.oid = ix.indrelid and i.oid = ix.indexrelid and a.attrelid = t.oid ";
        query += "and a.attnum = ANY(ix.indkey) and t.relkind = 'r' and t.oid = '" + tableOID + "' order by t.relname, i.relname;";
        return this.api.get(query);
    };
}]);
