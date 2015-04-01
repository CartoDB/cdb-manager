cdbmanager.service("columns", ["SQLClient", function (SQLClient) {
    this.api = new SQLClient();

    this.getAll = function (tableName, endpoint) {
        if (endpoint) {
            return this.api.get("SELECT * FROM information_schema.columns WHERE table_schema = '" + endpoint.account + "' AND table_name = '" + tableName+ "';");
        }
    };
}]);
