// Paginated table
// Use like: <cdb-result-table rows="data" settings="cdbrt"></cdb-result-table> where:
// data is the array with the rows to display
// cdbrt is an object with the settings for the table.
// Settings are:
//   id for the pagination widget
//   rowsPerPage acts as an init value for the input field
//   skip is a list of column names to skip when displaying
//   actions is a list of objects with text and onClick properties where on-click function that receives the row
//   headers is a list of headers, each item being {title: <HEADER TITLE>, name: <COLUMN NAME>}; if not present, they'll be taken from the first row
//   orderBy is  function that will be called on header click for column ordering; will get parameter name and page size
cdbmanager.directive('cdbResultTable', function () {
  return {
    restrict: "E",
    transclude: true,
    scope: {
      rows: "=rows",
      settings: "=settings",
      title: "=title"
    },
    replace: true,
    templateUrl: "ui/table.html",
    link: function link(scope) {
      scope.itemIsId = function (name) {
        return (name == 'cartodb_id');
      };

      scope.itemIsGeom = function (name) {
        return (name.startsWith('the_geom'));
      };

      scope.itemIsData = function (name, value) {
        return (name != "total_rows" && !scope.itemIsGeom(name) && !scope.itemIsId(name) && name != 'api' && (!scope.settings.skip || scope.settings.skip.indexOf(name) < 0) && typeof(value) != 'function');
      };

      scope.pageChanged = function (newPage) {
        if (scope.settings.async) {
          scope.settings.async(scope.settings.rowsPerPage, newPage * scope.settings.rowsPerPage);
        }
      };
    }
  }
});

// Display PostgreSQL's query plans
// Use like: <query-plan rows="data"></query-plan> where:
// data is the array with the rows to display
cdbmanager.directive('queryPlan', function () {
  return {
    restrict: "E",
    transclude: true,
    scope: {
      rows: "=rows"
    },
    replace: true,
    templateUrl: "ui/query_plan.html"
  }
});
