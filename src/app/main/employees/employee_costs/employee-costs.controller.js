(function () {
  'use strict';

  angular.module('app.employees').controller('EmployeeCostsController', EmployeeCostsController);

  /** @ngInject */
  function EmployeeCostsController(
    MESSAGES,
    ToastService,
    EmployeesService,
    EmployeeCostsService,
    $mdDialog,
    $rootScope,
    $document
  ) {
    var vm = this;

    vm.savePeriod = savePeriod;
    vm.addPeriodLeft = addPeriodLeft;
    vm.addPeriodRight = addPeriodRight;
    vm.dateLessOrEquals = dateLessOrEquals;
    vm.openXLSExportDialog = openXLSExportDialog;

    init();

    //////// CONTROLLER FUNCTIONS
    function init() {
      vm.role = $rootScope.currentUser.role;
      vm.active = 1;
      initPeriods();
    }

    function initPeriods() {
      vm.today = getCurrentPeriod();

      var end = {
        period_month: vm.today.period_month,
        period_year: vm.today.period_year
      };
      incrementDate(end);
      incrementDate(end);
      var begin = angular.copy(end);

      for (var i = 0; i < 7; i++) {
        decrementDate(begin);
      }

      var current = angular.copy(begin);
      var periods = [];

      while(dateLessOrEquals(current, end)) {
        periods.push({
          period_month: current.period_month,
          period_year: current.period_year,
          display: getMonthName(current.period_month) + ' ' + current.period_year
        });
        incrementDate(current);
      }

      vm.periods = periods;
      fetchEmployees({ begin: begin, end: end });
    }

    function fetchEmployees(date) {
      vm.loadingEmployees = true;

      var begin = {
        period_month: date.begin.period_month,
        period_year: date.begin.period_year
      };
      var end = {
        period_month: date.end.period_month,
        period_year: date.end.period_year
      };

      EmployeesService.indexWithCosts(begin,end)
        .then(function (response) {
          vm.loadingEmployees = false;
          vm.employees = response.data.plain().employees;
          formatEmployees();
        })
        .catch(function (response) {
          ToastService.showError(MESSAGES.imposibleToFetch + 'empleados')
        });
    }

    /**
     * Acomoda los costos de los empleados para representarlos en la tabla. Ademas, para los empleados que no
     * tienen costos en alguno de los periodos, entonces crea dicho objeto con costo = 0.
     */
    function formatEmployees() {
      var employeeCosts = [];
      var employeeCost;
      _.forEach(vm.employees, function (employee) {
        employeeCosts = [];
        _.forEach(vm.periods, function (period) {
          employeeCost = _.find(employee.employee_costs, function (o) {
            return o.period_year == period.period_year && o.period_month == period.period_month;
          });
          if (!employeeCost){
            employeeCost = {
              cost: 0,
              period_year: period.period_year,
              period_month: period.period_month,
              employee_id: employee.id
            };
          }
          employeeCost.cost_backup = employeeCost.cost;
          employeeCosts.push(employeeCost);
        });
        employee.employee_costs = employeeCosts;
      });
    }

    /**
     * Get the periods that has been changed.
     *
     * @param period
     * @returns {{ employee_costs: Array }}
     */
    function getChangedPeriods(period) {
      var employeeCost;
      var tosave = { employee_costs: [] };

      _.forEach(vm.employees, function (employee) {
        employeeCost = _.find(employee.employee_costs, function (o) {
          return o.period_year == period.period_year && o.period_month == period.period_month;
        });

        if (employeeCost && employeeCost.cost != employeeCost.cost_backup){
          tosave.employee_costs.push(employeeCost);
        }
      });

      return tosave;
    }

    /**
     * Send the periods to the backend to be saved.
     *
     * @param period
     * @param tosave
     */
    function savePeriods(period, tosave) {
      period.savingPeriod = true;
      EmployeeCostsService.createOrUpdateMany(tosave)
        .then(function (response) {
          var saved = response.data.plain().employee_costs;
          var employeeCostSaved;

          // updates the ids, because some could be created.
          _.forEach(tosave.employee_costs, function (employeeCost) {
            employeeCost.cost_backup = employeeCost.cost;

            employeeCostSaved = _.find(saved, function (o) {
              return o.employee_id == employeeCost.employee_id &&
                o.period_year == employeeCost.period_year &&
                o.period_month == employeeCost.period_month;
            });

            employeeCost.id = employeeCostSaved.id;
          });

          period.editEnabled = false;
          period.savingPeriod = false;
          vm.editEnabled = false;
        })
        .catch(function (response) {
          ToastService.showError(MESSAGES.imposibleToSave);
          restorePeriods(tosave);
          period.savingPeriod = false;
          vm.editEnabled=false;
        });
    }

    /**
     * Retore the periods given, with the previous values.
     * @param tosave
     */
    function restorePeriods(tosave) {
      _.forEach(tosave.employee_costs, function (employeeCost) {
        employeeCost.cost = employeeCost.cost_backup;
      });
    }

    ///////// UI FUNCTIONS

    /**
     * Guarda el periodo seleccionado. Para los periodos que ya existen solamente actualiza el costo, y para aquellos que no
     * existan crea uno nuevo.
     *
     * En caso de que no se confirme los cambios, entonces vuelve a reestrablecer los valores previos.
     *
     * @param period
     */
    function savePeriod(period) {
      if (!period.editEnabled) {
        period.editEnabled = true;

        var tosave = getChangedPeriods(period);

        var confirm = $mdDialog.confirm()
        .title(MESSAGES.areYouSureToSave)
        .targetEvent(event)
        .ok(MESSAGES.yes)
        .cancel(MESSAGES.no);
        $mdDialog.show(confirm)
        .then(function () {
          savePeriods(period, tosave);
        })
        .catch(function () {
          restorePeriods(tosave);
          period.editEnabled = false;
          vm.editEnabled = false;
        });
      }
      else {
        vm.editEnabled = true;
      }
    }

    function addPeriodLeft() {
      var first = {
        period_month: vm.periods[0].period_month,
        period_year: vm.periods[0].period_year
      };
      decrementDate(first);
      var newPeriod = {
        period_month: first.period_month,
        period_year: first.period_year,
        display: getMonthName(first.period_month) + ' ' + first.period_year
      };
      vm.periods.unshift(newPeriod);
      vm.periods.splice(-1,1);
      _.forEach(vm.employees, function (employee) {
        employee.employee_costs.splice(-1,1);
        employee.employee_costs.unshift({
          cost: 0,
          cost_backup: 0,
          period_year: newPeriod.period_year,
          period_month: newPeriod.period_month,
          employee_id: employee.id
        });
      });

      vm.fetchingPeriod = true;
      EmployeesService.indexWithCosts({
        period_month: newPeriod.period_month,
        period_year: newPeriod.period_year
      }, {
        period_month: newPeriod.period_month,
        period_year: newPeriod.period_year
      })
        .then(function (response) {
          var employees = response.data.plain().employees;
          _.forEach(vm.employees, function (employee) {
            var e = _.find(employees, function (o) {
              return o.id == employee.id;
            });
            if (e) {
              employee.employee_costs[0].cost = e.employee_costs.length > 0 && e.employee_costs[0].period_month == newPeriod.period_month && e.employee_costs[0].period_year == newPeriod.period_year ? e.employee_costs[0].cost : 0;
              employee.employee_costs[0].cost_backup = employee.employee_costs[0].cost;
              if (e.employee_costs.length > 0 && e.employee_costs[0].id){
                employee.employee_costs[0].id = e.employee_costs[0].id;
              }
            }
          });
          vm.fetchingPeriod = false;
        })
        .catch(function (response) {
          ToastService.showError(MESSAGES.imposibleToFetch + 'costos');
        });
    }

    function addPeriodRight() {
      var last = {
        period_month: vm.periods[vm.periods.length - 1].period_month,
        period_year: vm.periods[vm.periods.length - 1].period_year
      };
      incrementDate(last);
      var newPeriod = {period_month: last.period_month, period_year: last.period_year, display: getMonthName(last.period_month) + ' ' + last.period_year};
      vm.periods.push(newPeriod);
      vm.periods.shift();
      _.forEach(vm.employees, function (employee) {
        employee.employee_costs.shift();
        employee.employee_costs.push({
          cost: 0,
          cost_backup: 0,
          period_year: newPeriod.period_year,
          period_month: newPeriod.period_month,
          employee_id: employee.id
        });
      });

      vm.fetchingPeriod = true;
      EmployeesService.indexWithCosts({
        period_month: newPeriod.period_month, period_year: newPeriod.period_year
      }, {
        period_month: newPeriod.period_month,
        period_year: newPeriod.period_year
      })
        .then(function (response) {
          var employees = response.data.plain().employees;
          _.forEach(vm.employees, function (employee) {
            var e = _.find(employees, function (o) {
              return o.id == employee.id;
            });

            if (e) {
              employee.employee_costs[employee.employee_costs.length-1].cost = e.employee_costs.length > 0 && e.employee_costs[0].period_month == newPeriod.period_month && e.employee_costs[0].period_year == newPeriod.period_year ? e.employee_costs[0].cost : 0;
              employee.employee_costs[employee.employee_costs.length-1].cost_backup = employee.employee_costs[employee.employee_costs.length-1].cost;
              if (e.employee_costs.length > 0 && e.employee_costs[0].id){
                employee.employee_costs[0].id = e.employee_costs[0].id;
              }
            }
          });
          vm.fetchingPeriod = false;
        })
        .catch(function (response) {
          ToastService.showError(MESSAGES.imposibleToFetch + 'costos');
        });
    }

    function openXLSExportDialog(event) {
      if (event) {
        event.stopPropagation();
      }

      $mdDialog.show({
        controller: 'XLSExportEmployeeCostsDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/employees/employee_costs/xls_export/xls_export-dialog.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: event,
        locals: {
          periods: vm.periods,
          active: vm.active
        }
      })
    }
    ///////// UTILS

    function getMonthName(month) {
      switch (month){
        case 1: return 'Enero';
        case 2: return 'Febrero';
        case 3: return 'Marzo';
        case 4: return 'Abril';
        case 5: return 'Mayo';
        case 6: return 'Junio';
        case 7: return 'Julio';
        case 8: return 'Agosto';
        case 9: return 'Septiembre';
        case 10: return 'Octubre';
        case 11: return 'Noviembre';
        case 12: return 'Diciembre';
      }
    }

    function incrementDate(date) {
      date.period_year = (date.period_month == 12) ? date.period_year + 1 : date.period_year;
      date.period_month = (date.period_month < 12) ? date.period_month + 1 : 1;
    }

    function decrementDate(date) {
      date.period_year = (date.period_month == 1) ? date.period_year - 1 : date.period_year;
      date.period_month = (date.period_month > 1) ? date.period_month - 1 : 12;
    }

    function dateLessOrEquals(date1, date2) {
      if (date1.period_year == date2.period_year){
        return date1.period_month <= date2.period_month;
      }else {
        return date1.period_year < date2.period_year;
      }
    }

    function getCurrentPeriod() {
      var date = new Date();
      var periodYear = date.getFullYear();
      var periodMonth = date.getMonth() + 1;
      if (date.getDay() >= 21) {
        if (periodMonth == 12) {
          periodYear += 1;
          periodMonth = 1;
        }
        else {
          periodMonth += 1;
        }
      }
      return { period_year: periodYear, period_month: periodMonth };
    }
  }
})();
