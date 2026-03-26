(function () {
  'use strict';
  angular.module('app.works').service('SummaryService', SummaryService);

  /** @ngInject */
  function SummaryService($rootScope) {
    this.makeQuotesSummary = makeQuotesSummary;
    this.makeDailyReportsSummary = makeDailyReportsSummary;
    this.getNumberOfEmployeesThatAssignHours = getNumberOfEmployeesThatAssignHours;

    function getNumberOfEmployeesThatAssignHours(dailyReports) {
      var employees = {};
      var total = 0;
      _.forEach(dailyReports, function (dailyReport) {
        if (!employees[dailyReport.employee.id]) {
          employees[dailyReport.employee.id] = true;
          total++;
        }
      });

      return total;
    }

    function makeDailyReportsSummary(dailyReports) {
      var currentPeriod = getCurrentPeriod();
      var summary = {
        employee_areas: [],
        value: 0,
        value_current_period: 0,
        current_period: currentPeriod,
        places: [],
        cost: 0
      };

      var area = null;
      var speciality = null;
      var place = null;
      _.forEach(dailyReports, function (dailyReport) {
        area = findOrInitEmployeeArea(summary.employee_areas, dailyReport.speciality.employee_area);
        speciality = findOrInitSpeciality(area.specialities, dailyReport.speciality);
        place = findOrInitPlace(summary.places, dailyReport.place);

        speciality.value += dailyReport.minutes;
        area.value += dailyReport.minutes;
        place.value += dailyReport.minutes;
        summary.value += dailyReport.minutes;

        if (($rootScope.currentUser.role == 'UserAdmin' || $rootScope.currentUser.role == 'UserAreaChief' || $rootScope.currentUser.role == 'UserCoordinator' || $rootScope.currentUser.role == 'UserManager') && dailyReport.cost) {
          summary.cost += (dailyReport.minutes / 60) * dailyReport.cost.cost;
        }

        if (dailyReport.period_year == currentPeriod.period_year && dailyReport.period_month == currentPeriod.period_month) {
          summary.value_current_period += dailyReport.minutes;
        }
      });

      return summary;
    }

    /**
     * Create a summary of all work quotations loaded, group by areas and specialities.
     *
     * @param workQuotations
     * @returns {{employee_areas: Array, value: number}}
     */
    function makeQuotesSummary(workQuotations) {
      var summary = {
        employee_areas: [],
        value: 0
      };

      var area = null;
      var speciality = null;
      _.forEach(workQuotations, function (wq) {
        _.forEach(wq.work_quotation_specialities, function (wqSpeciality) {
          area = findOrInitEmployeeArea(summary.employee_areas, wqSpeciality.employee_area);
          speciality = findOrInitSpeciality(area.specialities, wqSpeciality.speciality);


          speciality.value += wqSpeciality.hours;
          area.value += wqSpeciality.hours;
          summary.value += wqSpeciality.hours;
        })
      });

      return summary;
    }

    function findOrInitPlace(places, place) {
      var p = _.find(places, function (e) {
        return e.name == place.name;
      });

      if (p == null) {
        p = {
          name: place.name,
          value: 0
        };

        places.push(p);
      }

      return p;
    }

    function findOrInitEmployeeArea(employeeAreas, employeeArea) {
      var area = _.find(employeeAreas, function (e) {
        return e.name == employeeArea.name;
      });

      if (area == null) {
        area = {
          name: employeeArea.name,
          value: 0,
          specialities: []
        };

        employeeAreas.push(area);
      }

      return area;
    }

    function findOrInitSpeciality(specialities, speciality) {
      var sp = _.find(specialities, function (s) {
        return s.name == speciality.name;
      });

      if (sp == null) {
        sp = {
          name: speciality.name,
          value: 0
        };

        specialities.push(sp);
      }

      return sp;
    }

    function getCurrentPeriod() {
      var date = new Date();

      var periodYear = date.getFullYear();
      var periodMonth = date.getMonth() + 1;

      if (date.getDay() >= 21) {
        if (periodMonth == 12) {
          periodYear += 1;
          periodMonth = 1;
        } else {
          periodMonth += 1;
        }
      }

      return { period_year: periodYear, period_month: periodMonth };
    }
  }

})();
