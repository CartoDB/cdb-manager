cdbmanager.service("constraints", ["SQLClient", function (SQLClient) {
    this.api = new SQLClient();

    this.getAll = function (table) {
        return this.api.get("select * from pg_constraint where conrelid = " + table._oid + ";");
    };
}]);
