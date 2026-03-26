(function () {
  'use strict';
  angular.module('app.api').service('DailyReportsService', DailyReportsService);

  /** @ngInject */
  function DailyReportsService(Restangular) {
    this.index = index;
    this.indexCurrentUser = indexCurrentUser;
    this.togglePeriod = togglePeriod;
    this.togglePeriodSelf = togglePeriodSelf;
    this.exportToXLS = exportToXLS;

    var RESOURCE = 'daily_reports';

    function index(params) {
      return Restangular.one(RESOURCE).get(params);
    }

    function indexCurrentUser(params) {
      return Restangular.one('daily_reports_current_user').get(params);
    }

    function togglePeriod(object) {
      return Restangular.one(RESOURCE).one('toggle_period').customPOST(object);
    }

    function togglePeriodSelf(object) {
      return Restangular.one(RESOURCE).one('toggle_period_self').customPOST(object);
    }

    function exportToXLS(params) {
      return Restangular.one(RESOURCE).one('export_to_xls').get(params);
    }
  }

})();
