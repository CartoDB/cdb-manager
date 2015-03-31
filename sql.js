cdbmanager.controller('sqlSelectorCtrl', ["$scope", "nav", function ($scope, nav) {
    $scope.nav = nav;
}]);


cdbmanager.controller('sqlCtrl', ["$scope", "SQLClient", "endpoints", "nav", function ($scope, SQLClient, endpoints, nav) {
    this.api = new SQLClient();

    var self = this;

    $scope.sql = {};
    $scope.nav = nav;

    var mime = 'text/x-mariadb';
    // get mime type
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

    $scope.$watch(function () {
        return endpoints.current;
    }, function () {
        $scope.sql.query = null;
        $scope.sql.result = null;
        $scope.sql.headers = null;
    }, true);


    $scope.$watch(function () {
        return self.api.raw;
    }, function (result) {
        $scope.sql.headers = [];
        if (result && result.data && result.data.rows && result.data.rows.length > 0) {
            $scope.sql.headers = Object.keys(result.data.rows[0]);
        }
        $scope.sql.result = result;
    });

    $scope.execSQL = function (query) {
        return self.api.get(query);
    }
}]);
