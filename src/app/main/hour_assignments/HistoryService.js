(function () {
  'use strict';
  angular.module('app.hour_assignments').service('HistoryService', HistoryService);

  /** @ngInject */
  function HistoryService() {
    this.makeHistory = makeHistory;

    function makeHistory(dailyReports) {
      var history = [];

      var d = null;
      _.forEach(dailyReports, function (report) {
        d = findOrCreateDate(history, report.date);
        d.daily_reports.push(report);
        d.value += report.minutes;
        d.value_parsed = parseMinutes(d.value);
        report.minutes_parsed = parseMinutes(report.minutes);
      });

      return history;
    }

    function findOrCreateDate(history, date) {
      var d = _.find(history, function (dateItem) {
        return dateItem.date === date;
      });

      if (d == null) {
        d = {
          date: date,
          value: 0,
          value_parsed: {},
          daily_reports: []
        };

        history.push(d);
      }

      return d;
    }

    function parseMinutes(minutes) {
      var h = Math.floor(minutes / 60);
      var m = minutes % 60;

      return {
        hours: h,
        minutes: m
      }
    }
  }

})();
