cdbmanager.controller('AlertCtrl', function ($scope, alerts) {
    $scope.alerts = alerts.get();

    $scope.closeAlert = function (index) {
        alerts.close(index);
    };
});

cdbmanager.service('alerts', function () {
    this.alerts = [];

    this.get = function () {
        return this.alerts;
    };

    this.add = function (type, msg) {
        if (type == "error") {
            type = "danger";
        } else if (type == "debug") {
            type = "info"
        }
        this.alerts.push({'type': type, 'msg': msg});
    };

    this.close = function (index) {
        this.alerts.splice(index, 1);
    };
});
