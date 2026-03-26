(function () {
  'use strict';
  angular.module('app.api').service('WorkQuotationsService', WorkQuotationsService);

  /** @ngInject */
  function WorkQuotationsService(Restangular) {
    this.create = create;
    this.update = update;
    this.destroy = destroy;

    var RESOURCE = 'work_quotations';

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
