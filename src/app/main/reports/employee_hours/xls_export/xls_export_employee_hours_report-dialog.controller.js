(function () {
  'use strict';
  angular.module('app.reports').controller('XLSEmployeeHoursDialogController', XLSEmployeeHoursDialogController);
  function XLSEmployeeHoursDialogController(
    MESSAGES,
    ToastService,
    ReportsService,
    $mdDialog,
    filters
  ) {
    // Export list of employee costs to XLSX
    var vm = this;
    vm.loading = true;
    vm.cancel = cancel;
    vm.item = {};
    vm.filters = filters;

    init();

    // CONTROLLER FUNCTIONS
    function init() {
      exportToXLS();
    }

    function exportToXLS() {
      var active = undefined;
      if (vm.filters.active == 1) {
        active = true;
      } else if (vm.filters.active == 0) {
        active = false;
      }

      ReportsService.exportEmployeeHoursToXLS(
        { active: active, period_month: vm.filters.month, period_year: vm.filters.year }
      )
        .then(function (response) {
          vm.item = response.data.employee_hours_report;
          vm.loading = false;
        })
        .catch(function () {
          ToastService.showError(MESSAGES.somethingHapped + " " + MESSAGES.imposibleToSave);
        });
    }

    // UI FUNCTIONS
    function cancel() {
      $mdDialog.cancel();
    }
  }
})();
