(function () {
  'use strict';
  angular.module('app.api').service('CheckinsService', CheckinsService);

  /** @ngInject */
  function CheckinsService(Restangular) {
    this.index = index;

    var RESOURCE = 'checkins';

    function index(params) {
      return Restangular.one(RESOURCE).get(params);
    }
  }
})();
