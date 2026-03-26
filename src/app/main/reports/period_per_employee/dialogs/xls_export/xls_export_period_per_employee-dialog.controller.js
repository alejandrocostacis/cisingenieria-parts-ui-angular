(function () {
  'use strict';
  angular.module('app.reports').controller('XLSPeriodPerEmployeeDialogController', XLSPeriodPerEmployeeDialogController);
  function XLSPeriodPerEmployeeDialogController(
    MESSAGES,
    ToastService,
    DailyReportsService,
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

      DailyReportsService.exportToXLS(
        { personnel_file: vm.filters.personnel_file, period_month: vm.filters.month, period_year: vm.filters.year }
      )
        .then(function (response) {
          vm.item = response.data.daily_report_report;
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
