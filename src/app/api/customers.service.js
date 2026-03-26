(function () {
  'use strict';
  angular.module('app.api').service('CustomersService', CustomersService);

  /** @ngInject */
  function CustomersService(Restangular) {
    this.show = show;
    this.index = index;
    this.create = create;
    this.update = update;
    this.destroy = destroy;
    this.works = works;
    this.economicUnits = economicUnits;

    var RESOURCE = 'customers';

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

    function economicUnits(id, params) {
      return Restangular.one(RESOURCE, id).one('economic_units').get(params);
    }

    function works(id, params) {
      return Restangular.one(RESOURCE, id).one('works').get(params);
    }
  }

})();
