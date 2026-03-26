(function () {
  'use strict';
  angular.module('app.api').service('BudgetsService', BudgetsService);

  /** @ngInject */
  function BudgetsService(Restangular) {
    this.show = show;
    this.index = index;

    var RESOURCE = 'budgets';

    function show(id) {
      return Restangular.one(RESOURCE, id).get();
    }

    function index(customerId, params) {
      return Restangular.one('customers', customerId).one('budget_per_works').get(params);
    }
  }
})();
