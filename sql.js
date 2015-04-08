cdbmanager.controller('sqlSelectorCtrl', ["$scope", "nav", function ($scope, nav) {
    $scope.nav = nav;
}]);


cdbmanager.controller('sqlCtrl', ["$scope", "SQLClient", "endpoints", "nav", "$localStorage", function ($scope, SQLClient, endpoints, nav, $localStorage) {
    this.api = new SQLClient();

    $localStorage.history = $localStorage.history || [];
    this.historyCurrent = $localStorage.history.length;
    this.historyBuffer = null;

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
        self.historyCurrent = $localStorage.history.length;
        self.historyBuffer = null;
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
        if ($localStorage.history[$localStorage.history.length - 1] != query) {
            $localStorage.history.push(query);
        }
        self.historyCurrent = $localStorage.history.length;
        self.historyBuffer = null;
        return self.api.get(query);
    };

    $scope.cleanHistory = function () {
        $localStorage.history = [];
        self.historyCurrent = 0;
        self.historyBuffer = null;
    };

    // Key bindings for history
    $scope.codemirrorLoaded = function (editor) {
        var ctrlUp = {
            "Ctrl-Up": function () {
                if (self.historyCurrent == $localStorage.history.length) {
                    self.historyBuffer = $scope.sql.query;
                }
                if (self.historyCurrent > 0) {
                    $scope.sql.query = $localStorage.history[--self.historyCurrent];
                    $scope.$apply();
                }
            }
        };
        editor.addKeyMap(ctrlUp);

        var ctrlDown = {
            "Ctrl-Down": function () {
                if (self.historyCurrent < $localStorage.history.length) {
                    ++self.historyCurrent;
                    if (self.historyCurrent < $localStorage.history.length) {
                        $scope.sql.query = $localStorage.history[self.historyCurrent];
                    } else {
                        $scope.sql.query = self.historyBuffer;
                    }
                    $scope.$apply();
                }
            }
        };
        editor.addKeyMap(ctrlDown);
    };
}]);
