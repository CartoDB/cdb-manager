cdbmanager.service('namedMaps', ["MapsClient", function (MapsClient) {
    this.api = new MapsClient();

    this.current = null;

    this.setCurrent = function (namedMap) {
        this.current = namedMap;
    };

    this.get = function () {
        this.api.get();
    };
}]);

cdbmanager.controller('namedMapSelectorCtrl', ["$scope", "nav", "namedMaps", function ($scope, nav, namedMaps) {
    $scope.nav = nav;

    $scope.currentNamedMap = null;

    $scope.showNamedMap = function (namedMap) {
        namedMaps.setCurrent(namedMap);
    };

    // keep the named map list in the scope always updated
    $scope.$watch(function () {
        return namedMaps.api.items;
    }, function (namedMapList) {
        $scope.namedMaps = namedMapList;
    });

    // update current named map pointer in scope when a new name map is selected
    $scope.$watch(function () {
        return namedMaps.current;
    }, function (currentNamedMap) {
        $scope.currentNamedMap = currentNamedMap;
    });

    namedMaps.get();
}]);

cdbmanager.controller('namedMapCtrl', ["$scope", "nav", "namedMaps", "endpoints", "$timeout", function ($scope, nav, namedMaps, endpoints, $timeout) {
    $scope.nav = nav;

    $scope.showVisualization = function () {
        var namedMap = namedMaps.current;

        nav.setCurrentView("namedMap.visualization");
        // We need to make sure the map is not created in an invisible area of the page, otherwise it won't render correctly
        $timeout(function () {
            $("#named_map").replaceWith('<div id="named_map" style="height: 500px"></div>');

            var map = L.map('named_map', {
                zoomControl: false,
                center: [43, 0],
                zoom: 3
            });

            L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
            }).addTo(map);

            cartodb.createLayer(map, {
                user_name: endpoints.current.account,
                type: 'namedmap',
                options: {
                    named_map: {
                        name: namedMap.name
                    }
                }
            }).addTo(map)
        });
    };

    // show map when selected map changes
    $scope.$watch(function () {
        return namedMaps.current;
    }, function (currentNamedMap) {
        if (currentNamedMap) {
            $scope.showVisualization();
        }
    });
}]);
