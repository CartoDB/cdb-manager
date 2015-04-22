// Takes care of changing the view on the main area of the app window
// View names are string:
//   * one word for simple views (e.g., tables)
//   * two words separated by a dot for tabbed views (e.g. table.columns means the column tab of a single table)
// Currently only those two levels are supported, but isCurrentView is prepared to support an arbitrary number of levels.
cdbmanager.service("nav", function () {
    this.current = null;

    // Better use this instead of setting current directly.
    // In the future it's quite possible that changing the current view will be
    // a more complex step.
    this.setCurrentView = function (viewName) {
        this.current = viewName;
    };

    this.isCurrentView = function (viewName) {
        if (!this.current) {
            return false;
        }

        viewName = viewName.split(".");
        var currentSplit = this.current.split(".");

        for (var i = 0; i < viewName.length; i++) {
            if (viewName[i] != currentSplit[i]) {
                return false;
            }
        }

        return true;
    }
});
