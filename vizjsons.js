// saves vizjsons to local storage
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

    this.setCurrent = function (vizjson) {
        this.current = vizjson;
    };
}]);

cdbmanager.controller('vizjsonSelectorCtrl', ["$scope", "nav", "vizjsons", function ($scope, nav, vizjsons) {
    $scope.nav = nav;

    $scope.showVizjson = function (vizjson) {
        nav.current = "vizjsons.editor";
        vizjsons.setCurrent(vizjson);
    };

    // keep the vizjson list in the scope always updated
    $scope.$watch(function () {
        return vizjsons.get();
    }, function (vizjsons) {
        $scope.vizjsons = vizjsons;
    });

    $scope.addVizjson = function (vizjson) {
        vizjsons.add(vizjson);
    };
}]);

cdbmanager.controller('vizjsonCtrl', ["$scope", "nav", "vizjsons", function ($scope, nav, vizjsons) {
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

    $scope.vizjsonInEditor = null;

    $scope.showEditor = function () {
        if ($scope.vizjsonInEditor) {
            nav.current = "vizjsons.editor";
        }
    };

    $scope.showVisualization = function () {
        nav.current = "vizjsons.visualization";
        $("#vizjson").replaceWith('<div id="vizjson" style="height: 500px"></div>');
        cartodb.createVis("vizjson", JSON.parse($scope.vizjsonInEditor.json));
    };

    $scope.$watch(function () {
        return vizjsons.current;
    }, function (vizjson) {
        $scope.vizjsonInEditor = angular.copy(vizjson);
        console.log($scope.vizjsonInEditor);
        $scope.showEditor();
    });

    $scope.updateCurrentVizjson = function (updatedVizjson) {
        vizjsons.update(vizjsons.current, updatedVizjson);
    };

    $scope.removeCurrentVizjson = function () {
        vizjsons.remove(vizjsons.current);
    };
}]);
