cdbmanager.directive('draggable', function () {
  return {
    restrict: 'A',
    link: function (scope, element) {
      element = element[0];
      element.addEventListener('dragstart', function (e) {
        element.style.opacity = '0.4';
        e.dataTransfer.setData('text', element.innerText);
        e.dataTransfer.effectAllowed = 'copy';
        return false;
      }, false);
      element.addEventListener('dragend', function (e) {
        element.style.opacity = '1';
        return false;
      }, false);
    }
  }
});

cdbmanager.directive('droppable', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      element[0].addEventListener('drop', scope.handleDrop, false);
      element[0].addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        return false;
      }, false);
    }
  }
});

cdbmanager.service("map", ["$timeout", function ($timeout) {
  let self = this;

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
    if (self.map._container.offsetParent) {
      self.reset();
      let source = new carto.source.SQL(query);
      let viz = new carto.Viz();
      let layer = new carto.Layer("layer", source, viz);
      layer.addTo(self.map);
    }
  };

  this.showGeometry = function (geometry) {
    if (self.map._container.offsetParent) {
      self.reset();
      let source = null;
      if (geometry.indexOf("10E6") >= 0 || geometry.indexOf("E610") >= 0) {
        source = new carto.source.SQL("select 1 as cartodb_id, the_geom, st_transform(the_geom, 3857) as the_geom_webmercator from (select '" + geometry + "'::geometry AS the_geom) c");
      } else if (geometry.indexOf("0F11") >= 0 || geometry.indexOf("110F") >= 0) {
        source = new carto.source.SQL("select 1 as cartodb_id, the_geom_webmercator, st_transform(the_geom_webmercator, 4326) as the_geom from (select '" + geometry + "'::geometry AS the_geom_webmercator) c");
      } else {
        source = new carto.source.SQL('SELECT * from "' + geometry + '"');
      }
      let viz = new carto.Viz();
      let layer = new carto.Layer("layer", source, viz);
      layer.addTo(self.map);
    }
  }
}]);

cdbmanager.controller('cartovlCtrl', ["$scope", "map", "endpoints", function ($scope, map, endpoints) {
  // keep the endpoint list in the scope always updated
  $scope.$watch(function () {
    return endpoints.current;
  }, function (currentEndpoint) {
    map.setAuth(currentEndpoint.account, currentEndpoint.apiKey)
  });

  $scope.handleDrop = function (e) {
    e.preventDefault();
    e.stopPropagation();
    let dataText = e.dataTransfer.getData('text');
    map.showGeometry(dataText);
  };
}]);
