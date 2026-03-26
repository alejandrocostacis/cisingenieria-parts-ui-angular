(function () {
  'use strict';
  angular.module('app.works').controller('XLSExportDialogController', XLSExportDialogController);
  function XLSExportDialogController(
    MESSAGES,
    ToastService,
    WorksService,
    $mdDialog,
    filters
  ) {
    // Export list of works to XLSX
    var vm = this;
    vm.loading = true;
    vm.cancel = cancel;
    vm.item = {};

    init();

    // CONTROLLER FUNCTIONS
    function init() {
      exportToXLS();

      vm.filters = angular.copy(filters);
    }

    function exportToXLS() {
      WorksService.exportToXLS(vm.filters)
      .then(function (response) {
        vm.item = response.data.works_report;
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
