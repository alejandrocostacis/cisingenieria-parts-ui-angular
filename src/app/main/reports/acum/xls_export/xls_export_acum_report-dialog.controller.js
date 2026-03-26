(function () {
  'use strict';
  angular.module('app.reports').controller('XLSAcumDialogController', XLSAcumDialogController);
  function XLSAcumDialogController(
    MESSAGES,
    ToastService,
    ReportsService,
    $mdDialog,
    filters,
    type
  ) {
    // Export list of employee costs to XLSX
    var vm = this;
    vm.loading = true;
    vm.cancel = cancel;
    vm.item = {};

    init();

    // CONTROLLER FUNCTIONS
    function init() {
      exportToXLS();
    }

    function exportToXLS() {
      ReportsService.exportAcumToXLS({
        type: type, // money or hours
        period_year: filters.year,
        active: filters.active,
        customer_id: filters.customer_id,
        employee_employee_area_id: filters.employee_employee_area_id,
        employee_id: filters.employee_id,
        speciality_employee_area_id: filters.speciality_employee_area_id,
        work_group_id: filters.work_group_id,
        work_id: filters.work_id,
        'work_state_ids[]': filters.work_state_ids
      })
        .then(function (response) {
          vm.item = response.data.acum_report;
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
