cdbmanager.controller('sqlCtrl', ["$scope", "SQLClient", function ($scope, SQLClient) {
    this.api = new SQLClient();

    var self = this;

    $scope.sql = {};

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
        return self.api.raw;
    }, function (result) {
        $scope.sql.result = result;
        console.log("RESULT", result);
    });

    $scope.execSQL = function (query) {
        console.log("QUERY", query);
        return self.api.get(query);
    }
}]);
