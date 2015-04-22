api.factory('Function', ["SQLClient", function (SQLClient) {
    return function (functionFromDB) {
        angular.extend(this, functionFromDB);

        this.api = new SQLClient();

        this.updateDefinition = function (action, error) {
            this.api.send(this.definition, action, error);
        }
    }
}]);

cdbmanager.service("functions", ["SQLClient", "Function", function (SQLClient, Function) {
    this.api = new SQLClient();

    this.current = null;

    this.get = function (action, error) {
        var self = this;

        var _action = function () {
            for (var i = 0; i < self.api.items.length; i++) {
                self.api.items[i] = new Function(self.api.items[i], self);
            }

            if (action) {
                action();
            }
        };

        this.api.send("select pg_proc.oid as _oid, pg_proc.*, pg_get_functiondef(pg_proc.oid) as definition from pg_proc, pg_roles where pg_proc.proowner = pg_roles.oid and pg_roles.rolname = current_user;", _action, error);
    };
}]);

cdbmanager.controller('functionSelectorCtrl', ["$scope", "functions", "endpoints", "nav", function ($scope, functions, endpoints, nav) {
    $scope.nav = nav;

    $scope.showFunction = function (func) {
        nav.setCurrentView("function");
        functions.current = func;
    };

    $scope.refreshList = function () {
        functions.get();
    };

    // update function list in scope when current endpoint changes
    $scope.$watch(function () {
        return endpoints.current;
    }, function () {
        $scope.functions = functions.get();
    }, true);

    // update function list in scope when actual function list change
    $scope.$watch(function () {
        return functions.api.items;
    }, function (functionList) {
        $scope.functions = functionList;
    });

    // update current function in scope when current function changes
    $scope.$watch(function () {
        return functions.current;
    }, function (currentFunction) {
        $scope.currentFunction = currentFunction;
    });
}]);

cdbmanager.controller('functionsCtrl', ["$scope", "functions", "endpoints", "nav", "settings", function ($scope, functions, endpoints, nav, settings) {
    $scope.nav = nav;

    // Result table config
    $scope.cdbrt = {
        rowsPerPage: settings.sqlConsoleRowsPerPage,
        skip: ["prosrc", "definition"]
    };
    $scope.actions = [
        {
            text: "View source code",
            onClick: function (func) {
                nav.setCurrentView("function");
                functions.current = func;
            }
        }
    ];

    // update function list in scope when current endpoint changes
    $scope.$watch(function () {
        return endpoints.current;
    }, function () {
        $scope.functions = functions.get();
    }, true);

    // update function list in scope when actual function list change
    $scope.$watch(function () {
        return functions.api.items;
    }, function (functionList) {
        $scope.functions = functionList;
    });
}]);

cdbmanager.controller('functionCtrl', ["$scope", "nav", "functions", "$timeout", function ($scope, nav, functions, $timeout) {
    $scope.nav = nav;

    $scope.running = null;
    $scope.error = null;
    $scope.updated = null;

    var editor = null;

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

    $scope.updateFunction = function (func) {
        func.updateDefinition(function () {
            functions.get();
        });
    };

    // update function in editor when current function changes
    $scope.$watch(function () {
        return functions.current;
    }, function (currentFunction) {
        $scope.functionInEditor = angular.copy(currentFunction);
    });

    // codemirror must be refreshed when not hidden anymore, otherwise the text won't show until you click on the editor
    $scope.$watch(function () {
        return nav.current;
    }, function () {
        if (nav.isCurrentView("function")) {
            // Need to refresh after digest cycle is over
            $timeout(function () {
                editor.refresh();
            });
        }
    });

    $scope.codemirrorLoaded = function (_editor) {
        editor = _editor;

        var ctrlEnter = {
            "Ctrl-Enter": function () {
                $scope.updateFunction($scope.functionInEditor);
            }
        };
        editor.addKeyMap(ctrlEnter);
    };
}]);
