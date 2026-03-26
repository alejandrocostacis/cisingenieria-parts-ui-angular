(function () {
  'use strict';
  angular.module('app.api').service('EmployeePositionsService', EmployeePositionsService);

  /** @ngInject */
  function EmployeePositionsService(Restangular) {
    this.show = show;
    this.index = index;
    this.create = create;
    this.update = update;
    this.destroy = destroy;

    var RESOURCE = 'employee_positions';

    function show(id) {
      return Restangular.one(RESOURCE, id).get();
    }

    function index(params) {
      return Restangular.one(RESOURCE).get(params);
    }

    function create(object) {
      return Restangular.all(RESOURCE).customPOST(object);
    }

    function update(id, object) {
      return Restangular.one(RESOURCE, id).customPUT(object);
    }

    function destroy(id) {
      return Restangular.one(RESOURCE, id).customDELETE();
    }
  }

})();
