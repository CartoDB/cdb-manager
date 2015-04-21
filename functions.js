cdbmanager.service("functions", ["SQLClient", function (SQLClient) {
    this.api = new SQLClient();

    this.current = null;

    this.getAll = function () {
        this.api.send("select pg_proc.oid as _oid, pg_proc.*, pg_get_functiondef(pg_proc.oid) as definition from pg_proc, pg_roles where pg_proc.proowner = pg_roles.oid and pg_roles.rolname = current_user;");
    };

    this.update = function (definition) {
        var api = this.api;
        var self = this;

        var action = function (result) {
            api.error400 = null;
            api.updated = true;
            api.running = false;
            ++api.lastQueryId;
            self.getAll();
        };

        var error = function (result) {
            api.updated = false;
            if (result.status == 400) {
                api.error400 = result.data.error[0];
            } else {
                var errorMessage = result.statusText;
                api.error400 = null;
                if (errorMessage) {
                    alerts.add("error", "Endpoint error: " + errorMessage);
                } else {
                    alerts.add("error", "Unknown endpoint error");
                }
            }
            api.running = false;
            ++api.lastQueryId;
        };

        this.api.send(definition, action, error);
    }
}]);

cdbmanager.controller('functionSelectorCtrl', ["$scope", "functions", "endpoints", "nav", function ($scope, functions, endpoints, nav) {
    $scope.nav = nav;

    $scope.showFunction = function (func) {
        nav.current = "functions.function";
        functions.current = func;
    };

    $scope.refreshList = function () {
        functions.getAll();
    };

    // update function list when current endpoint changes
    $scope.$watch(function () {
        return endpoints.current;
    }, function () {
        $scope.functions = functions.getAll();
    }, true);

    $scope.$watch(function () {
        return functions.api.items;
    }, function (functionList) {
        $scope.functions = functionList;
    });

    // Watch current function
    $scope.$watch(function () {
        return functions.current;
    }, function (currentFunction) {
        $scope.currentFunction = currentFunction;
    });
}]);

cdbmanager.controller('functionsCtrl', ["$scope", "functions", "endpoints", "nav", "settings", function ($scope, functions, endpoints, nav, settings) {
    $scope.nav = nav;

    $scope.cdbrt = {
        rowsPerPage: settings.sqlConsoleRowsPerPage,
        skip: ["prosrc"]
    };
    $scope.actions = [
        {
            text: "View source code",
            onClick: function (func) {
                nav.current = "functions.function";
                functions.current = func;
            }
        }
    ];

    // update function list when current endpoint changes
    $scope.$watch(function () {
        return endpoints.current;
    }, function () {
        $scope.functions = functions.getAll();
    }, true);

    $scope.$watch(function () {
        return functions.api.items;
    }, function (functionList) {
        $scope.functions = functionList;
    });
}]);

cdbmanager.controller('functionCtrl', ["$scope", "nav", "functions", function ($scope, nav, functions) {
    $scope.nav = nav;

    $scope.running = null;
    $scope.error = null;
    $scope.updated = null;

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
        functions.update(func.definition);
    };

    //
    $scope.$watch(function () {
        return functions.current;
    }, function (currentFunction) {
        $scope.functionInEditor = angular.copy(currentFunction);
        functions.api.updated = false;
    });

    $scope.$watch(function () {
        return functions.api.error400;
    }, function (error) {
        $scope.error = error;
    });

    $scope.$watch(function () {
        return functions.api.updated;
    }, function (updated) {
        $scope.updated = updated;
    });

    $scope.$watch(function () {
        return functions.api.running;
    }, function (running) {
        $scope.running = running;
    });

    $scope.codemirrorLoaded = function (editor) {
        var ctrlEnter = {
            "Ctrl-Enter": function () {
                $scope.updateFunction($scope.functionInEditor);
            }
        };
        editor.addKeyMap(ctrlEnter);
    };
}]);
