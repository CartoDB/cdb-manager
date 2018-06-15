cdbmanager.service('alerts', function() {
  let self = this;

  this.alerts = [];

  this.get = function () {
    return self.alerts;
  };

  // type can be one of: "success", "info" (or "debug"), "warning", "danger" (or "error")
  this.add = function (type, msg) {
    if (type == "error") {
      type = "danger";
    } else if (type == "debug") {
      type = "info";
    }
    self.alerts.push({
      'type': type,
      'msg': msg
    });
  };

  this.close = function (index) {
    if (index != undefined) {
      self.alerts.splice(index, 1);
    } else {
      self.alerts.length = 0;
    }
  };
});

cdbmanager.controller('AlertCtrl', function ($scope, alerts) {
  $scope.alerts = alerts.get();

  $scope.closeAlert = function (index) {
    alerts.close(index);
  };
});
