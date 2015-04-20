cdbmanager.service("columns", ["SQLClient", function (SQLClient) {
    this.api = new SQLClient();

    this.getAll = function (table) {
        return this.api.send("select attname, format_type(atttypid, atttypmod) as type from pg_attribute where attrelid = " + table._oid + " and attisdropped = false and attnum > 0;");
    };
}]);
