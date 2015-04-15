cdbmanager.service("columns", ["SQLClient", function (SQLClient) {
    this.api = new SQLClient();

    this.getAll = function (tableOID) {
        return this.api.get("select attname, format_type(atttypid, atttypmod) as type from pg_attribute where attrelid = " + tableOID + " and attisdropped = false;");
    };
}]);
