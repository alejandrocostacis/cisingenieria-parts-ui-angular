(function () {
  'use strict';

  angular.module('app.hour_assignments').controller('HourAssignmentsController', HourAssignmentsController);

  /** @ngInject */
  function HourAssignmentsController(
    MESSAGES,
    ToastService,
    HourAssignmentsService,
    DailyReportsService,
    HistoryService,
    ReportsService,
    $mdDialog, $document, $state, $log
  ) {
    var vm = this;

    vm.resume = [];
    vm.hourAssignments = [];
    vm.history = [];

    vm.openWork = openWork;
    vm.collapseAndExpandDate = collapseAndExpandDate;
    vm.openHourAssignmentDialog = openHourAssignmentDialog;
    vm.openClosePeriodDialog = openClosePeriodDialog;
    vm.fetchHourAssignments = fetchHourAssignments;
    vm.fetchResume = fetchResume;
    vm.getHistory = getHistory;

    init();

    //////// CONTROLLER FUNCTIONS
    function init() {
      var currentPeriod = getPeriod();

      vm.periodForm = {
        month: currentPeriod.period_month,
        year: currentPeriod.period_year
      };
      vm.periodResumeForm = {
        month: currentPeriod.period_month,
        year: currentPeriod.period_year
      };
      fetchHourAssignments()
        .then(function(result) {
        });

      vm.current_year = currentPeriod.period_year;

      vm.otherPeriodsForm = {
        month: currentPeriod.period_month - 1,
        year: currentPeriod.period_year
      };
    }

    ///////// UI FUNCTIONS
    function fetchHourAssignments() {
      var includes = '{__all: true, daily_reports: {__all: true, work: {id: true, name: true , employee: false}, employee: false}}';
      return HourAssignmentsService.index(
        {
          'filter[where][period_year]': vm.periodForm.year,
          'filter[where][period_month]': vm.periodForm.month,
          'filter[where][active]': true,
          'includes': includes
        })
        .then(function (response) {
          vm.hourAssignments = response.data.plain().checkins;

          _.forEach(vm.hourAssignments, function (item) {
            var minutesReported = 0;
            _.forEach(item.daily_reports, function (report) {
              minutesReported += report.minutes;
              report.minutes_parsed = parseMinutes(report.minutes);
            });

            item.minutes_to_assign = item.minutes - minutesReported;
            item.minutes_to_assign_parsed = parseMinutes(item.minutes_to_assign);
            item.minutes_parsed = parseMinutes(item.minutes);
          });
          return vm.hourAssignments;
        })
        .catch(function (response) {
          $log.error(response);
        });
    }

    function fetchResume() {
      vm.resume = [];
      var includes = '{__all: true, daily_reports: {__all: true, work: {id: true, name: true , employee: false}, employee: false}}';
      return HourAssignmentsService.index(
        {
          'filter[where][period_year]': vm.periodResumeForm.year,
          'filter[where][period_month]': vm.periodResumeForm.month,
          'filter[where][active]': true,
          'includes': includes
        })
        .then(function (response) {
          _.forEach(response.data.plain().checkins, function (item) {
            _.forEach(item.daily_reports, function (report) {
              var work = _.find(vm.resume, function (o) {
                return o.work.id == report.work.id;
              });
        
              if (!work) {
                vm.resume.push({
                  work: report.work,
                  places: [
                    {
                      id: report.place.id,
                      name: report.place.name,
                      minutes: report.minutes,
                      minutes_parsed: parseMinutes(report.minutes)
                    }
                  ],
                  minutes: report.minutes,
                  minutes_parsed: parseMinutes(report.minutes)
                });
              }
              else {
                work.minutes += report.minutes;
                work.minutes_parsed = parseMinutes(work.minutes);
        
                var place = _.find(work.places, function (o) {
                  return o.id == report.place.id;
                });
        
                if (!place) {
                  work.places.push({
                    id: report.place.id,
                    name: report.place.name,
                    minutes: report.minutes,
                    minutes_parsed: parseMinutes(report.minutes)
                  });
                } else {
                  place.minutes += report.minutes;
                  place.minutes_parsed = parseMinutes(place.minutes);
                }
              }
            });
          });
          return vm.resume;
        })
        .catch(function (response) {
          $log.error(response);
        });
    }

    function getHistory() {
      var month = vm.otherPeriodsForm.month;
      var year = vm.otherPeriodsForm.year;
      var includes = '{__all: true, work: {id: true, name: true , employee: false}, employee: false}';
      var filters = {
        'filter[where][period_year]': year,
        'filter[where][period_month]': month,
        'includes': includes
      };

      DailyReportsService.indexCurrentUser(filters)
        .then(function (response) {
          var dailyReports = response.data.plain().daily_reports;
          vm.history = HistoryService.makeHistory(dailyReports);
        })
        .catch(function () {
          ToastService.showError(MESSAGES.imposibleToFetch + 'reporte.');
        });

      ReportsService.employee_hours_self(filters)
        .then(function (items) {
          var responseItems = items.data.plain();
          vm.employeeHours = responseItems.items;
          vm.totals = responseItems.totals;
          // vm.ui.loadingItems = false;
        })
        .catch(function () {
          ToastService.showError(MESSAGES.imposibleToFetch + 'reporte.');
        });
    }

    function collapseAndExpandDate(item) {
      item.expanded = !item.expanded;
    }

    function openHourAssignmentDialog(event, hourAssignment, report) {
      if (event) {
        event.stopPropagation();
      }

      $mdDialog.show({
        controller: 'HourAssignmentDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/hour_assignments/dialogs/hour_assignment/hour-assignment-dialog.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: event,
        locals: {
          hourAssignment: hourAssignment,
          item: report,
          callback: fetchHourAssignments
        }
      });
    }

    function openWork(id) {
      $state.go('app.works.works.work', id);
    }

    function openClosePeriodDialog(event) {
      if (event) {
        event.stopPropagation();
      }

      $mdDialog.show({
        controller: 'ClosePeriodDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/hour_assignments/dialogs/close_period/close-period-dialog.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: event,
        locals: {
          period: vm.periodForm,
          callback: fetchHourAssignments
        }
      });
    }

    //////// UTILS

    function getPeriod(diff) {
      var date = new Date();
      if (diff != undefined) {
        date.setMonth(date.getMonth() + diff);
      }
      var periodYear = date.getFullYear();
      var periodMonth = date.getMonth() + 1;
      if (date.getUTCDate() >= 21) {
        if (periodMonth == 12) {
          periodYear += 1;
          periodMonth = 1;
        } else {
          periodMonth += 1;
        }
      }
      return { period_year: periodYear, period_month: periodMonth };
    }

    function parseMinutes(minutes) {
      return {
        hours: Math.floor(minutes / 60),
        minutes: minutes % 60
      }
    }
  }
})();
