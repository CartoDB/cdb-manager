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
    this.initSetting("showBuilderNamedMaps", false);
    this.initSetting("showOverviewTables", false);
}]);

cdbmanager.controller('settingsCtrl', ["$scope", "$localStorage", "settings", function ($scope, $localStorage, settings) {
    $scope.settings = settings;

    $scope.$watch(function () {
        return JSON.stringify(settings);
    }, function () {
        for (var key in settings) {
            if (settings.hasOwnProperty(key)) {
                $localStorage.settings[key] = settings[key];
            }
        }
    });
}]);
