(function () {
  'use strict';

  angular.module('app.works').controller('WorksReportsController', WorksReportsController);

  /** @ngInject */
  function WorksReportsController(
    MESSAGES,
    WorksReportsService,
    ToastService,
    $log,
    $rootScope
  ) {
    var vm = this;
    vm.remove = remove;
    init();

    // ####################################  UI FUNCTIONS
    // ####################################  CONTROLLER FUNCTIONS

    function init() {
      vm.role = $rootScope.currentUser.role;
      WorksReportsService.index()
      .then(function(response) {
        $log.info(response);
        vm.items = response.data.works_reports;
      })
      .catch(function() {
        ToastService.showError(MESSAGES.imposibleToFetchOne + 'reportes de obra');
      })
    }

    function remove(item) {
      $log.info(item)
    }
  }
})();
