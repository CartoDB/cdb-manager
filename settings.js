cdbmanager.service('settings', ["$localStorage", function ($localStorage) {
    $localStorage.settings = $localStorage.settings || {};

    this.initSetting = function (name, defaultValue) {
        if ($localStorage.settings[name] == undefined) {
            $localStorage.settings[name] = defaultValue;
        }
        this[name] = $localStorage.settings[name];
    };

    this.initSetting("rowsPerPage", 10);
    this.initSetting("sqlConsoleRowsPerPage", 3);
}]);

cdbmanager.controller('settingsCtrl', ["$scope", "$localStorage", function ($scope, $localStorage) {
    $scope.settings = $localStorage.settings;
}]);
