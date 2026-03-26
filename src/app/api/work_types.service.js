(function () {
  'use strict';
  angular.module('app.api').service('WorkTypesService', WorkTypesService);

  /** @ngInject */
  function WorkTypesService(Restangular) {
    this.show = show;
    this.index = index;
    this.create = create;
    this.update = update;
    this.destroy = destroy;

    var RESOURCE = 'work_types';

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
