(function () {
  'use strict';

  angular.module('app.hour_assignments').controller('ClosePeriodDialogController', ClosePeriodDialogController);

  function ClosePeriodDialogController(
    MESSAGES,
    ToastService,
    $mdDialog,
    $scope,
    $rootScope,
    DailyReportsService,
    period,
    callback
  ) {
    var vm = this;
    vm.cancel = cancel;
    vm.save = save;

    init();

    ///////// CONTROLLER FUNCTIONS
    function init() {
      vm.period = angular.copy(period);
    }

    function close() {
      callback();
      $mdDialog.hide();
    }

    function save() {
      DailyReportsService.togglePeriodSelf({
        filter: {
          where: {
            period_year: period.year,
            period_month: period.month
          }
        },
        'open': false
      })
        .then(function () {
          ToastService.show(MESSAGES.savedSuccessfuly);
          close();
        })
        .catch(function (response) {
          ToastService.showError(MESSAGES.somethingHapped + " " + MESSAGES.imposibleToSave);
        });
    }

    ///////////// UI FUNCTIONS

    function cancel() {
      $mdDialog.cancel();
    }
  }
})();
