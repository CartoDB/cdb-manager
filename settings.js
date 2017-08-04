cdbmanager.service('settings', ["$localStorage", function ($localStorage) {
    var self = this;

    $localStorage.settings = $localStorage.settings || {};

    this.initSetting = function (name, defaultValue) {
        if ($localStorage.settings[name] == undefined) {
            $localStorage.settings[name] = defaultValue;
        }
        self[name] = $localStorage.settings[name];
    };

    this.initSetting("rowsPerPage", 10);
    this.initSetting("sqlConsoleRowsPerPage", 10);
    this.initSetting("showAnalysisTables", false);
}]);

cdbmanager.controller('settingsCtrl', ["$scope", "$localStorage", "settings", function ($scope, $localStorage, settings) {
    $scope.settings = settings;

    $scope.$watch(function () {
        return JSON.stringify($localStorage.settings);
    }, function () {
        for (var key in $localStorage.settings) {
            if ($localStorage.settings.hasOwnProperty(key)) {
                $scope.settings[key] = $localStorage.settings[key];
            }
        }
    });
}]);
