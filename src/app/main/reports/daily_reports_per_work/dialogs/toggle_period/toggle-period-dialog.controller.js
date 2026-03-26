(function () {
  'use strict';

  angular.module('app.reports').controller('TogglePeriodDialogController', TogglePeriodDialogController);

  function TogglePeriodDialogController(
    MESSAGES, ToastService, DailyReportsService,
    period, open, employee, callback,
    $rootScope, $scope, $mdDialog, $log
  ) {
    var vm = this;
    vm.cancel = cancel;
    vm.save = save;

    init();

    ///////// CONTROLLER FUNCTIONS
    function init() {
      vm.period = angular.copy(period);
      vm.open = open;
      vm.employee = employee;
    }

    function close() {
      callback();
      $mdDialog.hide();
    }

    function save() {
      var reqObj = {
        filter: {
          where: {
            period_year: period.period_year,
            period_month: period.period_month,
            employee_id: vm.employee.id
          }
        },
        open: vm.open
      }

      DailyReportsService.togglePeriod(reqObj)
        .then(function () {
          ToastService.show(MESSAGES.savedSuccessfuly);
        }).catch(function (response) {
          ToastService.showError(MESSAGES.somethingHapped + " " + MESSAGES.imposibleToSave);
        })
        .finally(function () {
          close();
        });
    }

    ///////////// UI FUNCTIONS
    function cancel() {
      $mdDialog.cancel();
    }
  }
})();
