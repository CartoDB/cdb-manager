// Paginated table
// Use like: <cdb-result-table rows="data" settings="cdbrt"></cdb-result-table> where:
// data is the array with the rows to display (columns starting with _ will not be displayed)
// cdbrt is an object with the settings for the table.
// Settings are: rowsPerPage (which acts as an init value for the input field) and skip (list of column names to skip when displaying)
// actions is a list of objects with text and onClick properties where on-click function that receives the row
// headers is a list of headers; if not present, they'll be taken from the first row
cdbmanager.directive('cdbResultTable', function () {
    return {
        restrict: "E",
        transclude: true,
        scope: {
            rows: "=rows",
            settings: "=settings",
            headers: "=headers",
            actions: "=actions"
        },
        replace: true,
        templateUrl: "ui/table.html",
        link: function link(scope) {
            scope.itemIsData = function (name, value) {
                return (name != 'api' && !name.startsWith('_') && (!scope.settings.skip || scope.settings.skip.indexOf(name) < 0) && typeof(value) != 'function');
            }
        }
    }
});
