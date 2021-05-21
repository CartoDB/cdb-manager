let api = angular.module("api", []);

// generic function for sending requests through a $http-like http service
// obj is the api object that makes the request
// action and error are promises to be run on success and error respectively and after the
// corresponding default promises have been run
function sendRequest(obj, request, httpService, action, error) {
  obj.running = true;
  obj.valid = null;
  obj.raw = null;

  // action and error are functions for the promise. if defined they'll be run after the default action and error functions
  let _action = function (result) {
    obj.raw = result;
    obj.valid = true;

    if (action) {
      action(result);
    }

    obj.running = false;
  };

  let _error = function (result) {
    obj.raw = result;
    obj.valid = false;

    if (error) {
      error(result);
    }

    obj.running = false;
  };

  httpService(request).then(_action).catch(_error);
}

// SQLClient makes request to CARTO's SQL API
// internal objects:
//   running, valid and raw from sendRequest
//   items: list of objects returned by the database on success
//   errorMessage: error message on error
api.factory('SQLClient', ["$http", "endpoints", "alerts", function ($http, endpoints, alerts) {
  return function () {
    let self = this;

    this.items = null;
    this.errorMessage = null;

    // action and error are functions for the promise. if defined they'll be run after the default action and error functions
    this.send = function (query, action, error, maxRetry) {
      let currentEndpoint = endpoints.current;
      maxRetry = maxRetry || 0;

      if (currentEndpoint && currentEndpoint.sqlURL) {
        let params = {
          q: query
        };
        if (currentEndpoint.apiKey) {
          params.api_key = currentEndpoint.apiKey;
        }
        let req = {
          method: 'GET',
          url: currentEndpoint.sqlURL,
          params: params
        };

        let _action = function (result) {
          if (result.data && result.data.rows.length > 0) {
            self.items = result.data.rows;
          } else {
            self.items = null;
          }
          self.errorMessage = null;

          if (action) {
            action(result);
          }
        };

        let _error = function (result) {
          self.items = null;
          if (result.status == 400) {
            // PostgreSQL error
            self.errorMessage = result.data.error[0];
          } else if (result.status == 429 && maxRetry < 6) {
            const retryAfter = Number(result.headers()['retry-after']) * 1000 || 1000;
            maxRetry += 1;
            setTimeout(() => {
              this.send(query, action, error, maxRetry);
            }, retryAfter);
          } else {
            // Network error
            self.errorMessage = result.statusText;
            if (self.errorMessage) {
              alerts.add("error", "Endpoint error: " + self.errorMessage);
            } else {
              alerts.add("error", "Unknown endpoint error");
            }
          }

          if (error) {
            error(result);
          }
        };

        sendRequest(self, req, $http, _action, _error);
      }
    };
  };
}]);
