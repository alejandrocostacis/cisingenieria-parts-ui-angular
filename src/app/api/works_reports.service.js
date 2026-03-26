(function () {
  'use strict';
  angular.module('app.api').service('WorksReportsService', WorksReportsService);

  /** @ngInject */
  function WorksReportsService(Restangular) {
    // this.show = show;
    this.index = index;
    // this.create = create;
    // this.update = update;
    // this.destroy = destroy;

    var RESOURCE = 'works_reports';

    // function show(id) {
    //   // var canceler = $q.defer();
    //   return Restangular.one(RESOURCE, id).get();
    // }

    function index(params) {
      return Restangular.one(RESOURCE).get(params);
    }

    // function create(object) {
    //   return Restangular.all(RESOURCE).customPOST(object);
    // }

    // function update(id, object) {
    //   return Restangular.one(RESOURCE, id).customPUT(object);
    // }

    // function destroy(id) {
    //   return Restangular.one(RESOURCE, id).customDELETE();
    // }
  }

})();
