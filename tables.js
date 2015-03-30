cdbmanager.service('tables', ["api", function (api) {
    this.all = function () {
        return $localStorage.servers;
    };
}]);

cdbmanager.controller('tablesCtrl', ["$scope", "servers", "api", function ($scope, servers, api) {
    $scope.$watch(function () {
        return $scope.current;
    }, function (currentServer) {
        console.log("CURR", currentServer);
        return api.get("SELECT * FROM information_schema.tables WHERE table_schema = '" + currentServer.name + "' ORDER BY table_schema, table_name;");
    });

    $scope.$watch(function () {
        return api.items;
    }, function (tables) {
        $scope.tables = tables;
    });

}]);
