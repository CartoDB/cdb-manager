cdbmanager.controller('sqlSelectorCtrl', ["$scope", "nav", function ($scope, nav) {
    $scope.nav = nav;
}]);


cdbmanager.controller('sqlCtrl', ["$scope", "SQLClient", "endpoints", "nav", "$localStorage", function ($scope, SQLClient, endpoints, nav, $localStorage) {
    var self = this;

    this.api = new SQLClient();

    $localStorage.history = $localStorage.history || [];

    this.historyCurrent = null;  // Idx to the current position in the history array. If greater than its size, we're not browsing the history.
    this.historyBuffer = null;  // Temporary buffer for the current input when browsing the history.

    $scope.sql = {};
    $scope.nav = nav;
    $scope.running = false;
    $scope.historyNotFound = false;

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

    this.setHistoryCurrent = function (idx) {
        self.historyCurrent = idx;
        $scope.historyNotFound = false;
        if (idx < $localStorage.history.length) {
            $scope.sql.query = $localStorage.history[self.historyCurrent];
        } else {
            $scope.sql.query = self.historyBuffer;
        }
    };

    this.resetEditor = function () {
        $scope.sql.result = null;
        $scope.sql.headers = null;
        $scope.running = false;
        $scope.historyNotFound = false;
        self.historyBuffer = "";
        self.setHistoryCurrent($localStorage.history.length);
    };

    $scope.resetConsole = function () {
        self.resetEditor();
    };

    // clean console if current endpoint changes
    $scope.$watch(function () {
        return endpoints.current;
    }, function () {
        self.resetEditor();
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
        self.historyCurrent = $localStorage.history.length;
        if ($localStorage.history[self.historyCurrent - 1] != query) {
            $localStorage.history.push(query);
        }
        self.historyBuffer = "";
        $scope.historyNotFound = false;
        return self.api.get(query);
    };

    $scope.cleanHistory = function () {
        $localStorage.history = [];
        // Now we don't call resetEditor directly because we don't want to lose the current input.
        self.historyCurrent = 0;
        self.historyBuffer = "";
    };

    $scope.searchHistory = function (needle) {
        for (var i = self.historyCurrent - 1; i >= 0; i--) {
            var historyIdx = $localStorage.history[i].indexOf(needle);
            if (historyIdx >= 0) {
                self.setHistoryCurrent(i);
                return;
            }
        }
        $scope.historyNotFound = true;
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

    this.resetEditor();
}]);
