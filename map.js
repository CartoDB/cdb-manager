cdbmanager.service("map", ["$timeout", function ($timeout) {
    var self = this;
    this.layerCounter = 0;

    this.reset = function () {
        self.map = new mapboxgl.Map({
              container: 'map',
              style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
        });
    };

    this.reset();

    this.setAuth = function (user, apiKey) {
        carto.setDefaultAuth({
            user: user,
            apiKey: apiKey
        });
    };

    this.update = function (query) {
        var source = new carto.source.SQL(query);
        var viz = new carto.Viz();
        var layer = new carto.Layer("layer_" + self.layerCounter, source, viz);
        layer.addTo(self.map);
        self.layerCounter++;
    };
}]);

cdbmanager.controller('cartovlCtrl', ["$scope", "map", "endpoints", function ($scope, map, endpoints) {
    $scope.reset = function () {
        map.reset();
    }

    // keep the endpoint list in the scope always updated
    $scope.$watch(function () {
        return endpoints.current;
    }, function (currentEndpoint) {
        map.setAuth(currentEndpoint.account, currentEndpoint.apiKey)
    });

}]);
