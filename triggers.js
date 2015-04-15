cdbmanager.service("triggers", ["SQLClient", function (SQLClient) {
    this.api = new SQLClient();

    this.getAll = function (table) {
        return this.api.get("select * from pg_trigger where tgrelid = " + table._oid + ";");
    };
}]);
