// Paginated table
// Use like: <cdb-result-table rows="data" settings="cdbrt"></cdb-result-table> where:
// data is the array with the rows to display
// cdbrt is an object with the settings for the table. Currently, only rowsPerPage is supported, which acts as an init value for the input field
// actions is a list of objects with text, onClick and idField properties where on-click function that receives a parameter taken from row[idField]
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
        templateUrl: "ui/table.html"
    }
});
