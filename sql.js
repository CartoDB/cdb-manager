cdbmanager.controller('sqlSelectorCtrl', ["$scope", "nav", function ($scope, nav) {
    $scope.nav = nav;
}]);


cdbmanager.controller('sqlCtrl', ["$scope", "SQLClient", "endpoints", "nav", function ($scope, SQLClient, endpoints, nav) {
    this.api = new SQLClient();

    var self = this;

    $scope.sql = {};
    $scope.nav = nav;
    $scope.running = false;

    // codemirror configuration
    var mime = 'text/x-mariadb';
    if (window.location.href.indexOf('mime=') > -1) {
        mime = window.location.href.substr(window.location.href.indexOf('mime=') + 5);
    }
    $scope.editorOptions = {
        mode: 'text/x-sql',
        indentWithTabs: false,
        smartIndent: true,
        lineNumbers: true,
        matchBrackets : true,
        autofocus: true
    };

    // clean console if current endpoint changes
    $scope.$watch(function () {
        return endpoints.current;
    }, function () {
        $scope.running = false;
        $scope.sql.query = null;
        $scope.sql.result = null;
        $scope.sql.headers = null;
    }, true);


    // query executed successfully
    $scope.$watch(function () {
        return self.api.raw;
    }, function (result) {
        $scope.running = false;
        $scope.sql.result = result;
    });

    $scope.execSQL = function (query) {
        $scope.running = true;
        return self.api.get(query);
    }
}]);
