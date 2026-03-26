(function () {
  'use strict';
  angular.module('app.employees').controller('XLSExportEmployeeCostsDialogController', XLSExportEmployeeCostsDialogController);
  function XLSExportEmployeeCostsDialogController(
    MESSAGES,
    ToastService,
    EmployeeCostsService,
    $mdDialog,
    periods,
    active
  ) {
    // Export list of employee costs to XLSX
    var vm = this;
    vm.loading = true;
    vm.cancel = cancel;
    vm.item = {};
    vm.periods = angular.copy(periods);
    vm.active = angular.copy(active);

    init();

    // CONTROLLER FUNCTIONS
    function init() {
      exportToXLS();
    }

    function exportToXLS() {
      EmployeeCostsService.exportToXLS({
        periods: vm.periods.map(
          function (p) { return { period_month: p.period_month, period_year: p.period_year } }
        ),
        active: vm.active
      })
        .then(function (response) {
          vm.item = response.data.employees_costs_report;
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
