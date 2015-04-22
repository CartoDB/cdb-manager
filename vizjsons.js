cdbmanager.service('vizjsons', ["$localStorage", function ($localStorage) {
    $localStorage.vizjsons = $localStorage.vizjsons || [];

    this.current = null;

    this.get = function () {
        return $localStorage.vizjsons;
    };

    this.add = function (vizjson) {
        $localStorage.vizjsons.push(angular.copy(vizjson));
        this.setCurrent(vizjson);
    };

    this.update = function (vizjson, properties) {
        for (var propertyName in properties) {
            if (properties.hasOwnProperty(propertyName)) {
                vizjson[propertyName] = properties[propertyName];
            }
        }
    };

    this.remove = function (vizjson) {
        $localStorage.vizjsons = $localStorage.vizjsons.filter(function (_vizjson) {
            return vizjson != _vizjson;
        });

        if (this.current == vizjson) {
            this.setCurrent(null);
        }
    };

    this.nameIsUsed = function (name) {
        var vizjsons = this.get();

        for (var i = 0; i < vizjsons.length; i++) {
            if (vizjsons[i].name === name) {
                return false;
            }
        }
        return true;
    };

    this.setCurrent = function (vizjson) {
        this.current = vizjson;
    };
}]);

cdbmanager.controller('vizjsonSelectorCtrl', ["$scope", "nav", "vizjsons", function ($scope, nav, vizjsons) {
    $scope.nav = nav;

    $scope.currentVizjson = null;

    $scope.showVizjson = function (vizjson) {
        nav.setCurrentView("vizjson.editor");
        vizjsons.setCurrent(vizjson);
    };

    $scope.nameIsValid = function (name) {
        return vizjsons.nameIsUsed(name);
    };

    $scope.addVizjson = function (vizjson) {
        vizjsons.add(vizjson);
        $scope.newVizjson = {};
    };

    // keep the vizjson list in the scope always updated
    $scope.$watch(function () {
        return vizjsons.get();
    }, function (vizjsons) {
        $scope.vizjsons = vizjsons;
    });

    // update current vizjson pointer in scope when a new vizjson is selected
    $scope.$watch(function () {
        return vizjsons.current;
    }, function (currentVizjson) {
        $scope.currentVizjson = currentVizjson;
    });
}]);

cdbmanager.controller('vizjsonCtrl', ["$scope", "nav", "vizjsons", "$timeout", function ($scope, nav, vizjsons, $timeout) {
    $scope.nav = nav;

    $scope.editorOptions = {
        mode: 'application/ld+json',
        indentWithTabs: false,
        smartIndent: true,
        lineNumbers: true,
        matchBrackets : true,
        lineWrapping: true,
        autofocus: true
    };

    var editor = null;

    $scope.vizjsonInEditor = null;

    $scope.showEditor = function () {
        if ($scope.vizjsonInEditor) {
            nav.setCurrentView("vizjson.editor");
        }
        // codemirror must be refreshed when not hidden anymore, otherwise the text won't show until you click on the editor
        // Need to refresh after digest cycle is over
        $timeout(function () {
            editor.refresh();
        });
    };

    $scope.showVisualization = function () {
        nav.setCurrentView("vizjson.visualization");
        // We need to make sure the map is not created in an invisible area of the page, otherwise it won't render correctly
        $timeout(function () {
            $("#vizjson").replaceWith('<div id="vizjson" style="height: 500px"></div>');
            cartodb.createVis("vizjson", JSON.parse($scope.vizjsonInEditor.json));
        });
    };

    $scope.$watch(function () {
        return vizjsons.current;
    }, function (vizjson) {
        $scope.vizjsonInEditor = angular.copy(vizjson);
        $scope.showEditor();
    });

    $scope.updateCurrentVizjson = function (updatedVizjson) {
        vizjsons.update(vizjsons.current, updatedVizjson);
    };

    $scope.removeCurrentVizjson = function () {
        vizjsons.remove(vizjsons.current);
    };

    $scope.codemirrorLoaded = function (_editor) {
        editor = _editor;
    };

}]);
