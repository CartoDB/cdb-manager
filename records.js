cdbmanager.service("records", ["SQLClient", function (SQLClient) {
    this.api = new SQLClient();

    this.getAll = function (table) {
        return this.api.get("select * from " + table.relname + ";");
    };
}]);
