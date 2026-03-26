(function () {
  'use strict';
  angular.module('app.api').service('EconomicUnitsService', EconomicUnitsService);

  /** @ngInject */
  function EconomicUnitsService(Restangular) {
    this.show = show;
    this.create = create;
    this.update = update;
    this.destroy = destroy;

    var RESOURCE = 'economic_units';

    function show(id) {
      return Restangular.one(RESOURCE, id).get();
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
