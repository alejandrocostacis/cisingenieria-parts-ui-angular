(function () {
  'use strict';

  angular.module('app.reports').controller('PeriodPerEmployeeController', PeriodPerEmployeeController);

  /** @ngInject */
  function PeriodPerEmployeeController(
    MESSAGES, ToastService, SummaryService,
    DTDefaultOptions, DailyReportsService,
    HistoryService, ReportsService, EmployeesService,
    $rootScope, $scope, $mdMedia, $mdDialog, $document
  ) {
    var vm = this;
    var currentYear = (new Date()).getFullYear();
    var currentMonth = (new Date()).getMonth();
    var views = {};
    var default_filters = {
      'filter[where][period_year]': currentYear,
      'filter[where][period_month]': currentMonth
    };

    vm.changeView = changeView;
    vm.fetchItems = fetchItems;
    vm.searchClick = searchClick;
    vm.parseMinutes = parseMinutes;
    vm.openClosePeriodDialog = openClosePeriodDialog;
    vm.openXLSExportDialog = openXLSExportDialog;

    vm.collapseAndExpandDate = collapseAndExpandDate;

    init();

    // ####################################  UI FUNCTIONS
    function searchClick() {
      vm.filters = angular.copy(default_filters);

      // if (vm.filterForm.active > -1) {
      //   vm.filters['filter[where][active]'] = vm.filterForm.active;
      // }

      fetchItems();
    }

    function changeView(viewName) {
      if (views[viewName]) {
        vm.defaultView = views[viewName];
        vm.currentView = views[viewName];
      }

      vm.currentView = views[viewName];
      vm.currentItem = null;
    }

    // ####################################  CONTROLLER FUNCTIONS

    function init() {
      vm.ui = {};
      vm.role = $rootScope.currentUser.role;
      vm.current_year = currentYear;
      initTable();
      initFilters();
      initListView();
      initScreenResizeWatchers();
      fetchEmployees();
    }

    function initTable() {
      DTDefaultOptions.setLoadingTemplate('<div>Cargando registros...</div>');
      vm.dtInstance = {};
      vm.dtOptions = {
        dom: 'rt<"bottom"<"left"<"length"l>><"right"<"info"i><"pagination"p>>>',
        pagingType: 'simple',
        lengthMenu: [50, 100, 500, 1000, 10000],
        pageLength: 10000,
        scrollY: 'auto',
        responsive: true
      };
    }

    function initFilters() {
      vm.filters = angular.copy(default_filters);
      vm.filterInputs = {};
      vm.filterForm = {
        year: currentYear,
        month: currentMonth
      };
    }

    function fetchEmployees() {
      EmployeesService.index({
        'sort[by]': 'personnel_file',
        'sort[order]': 'ASC',
        'includes': '{id:true, personnel_file: true, name: true, lastname: true, acronym: true, user: { email: true, active:true}}'
      }).then(function (response) {
        vm.employees = response.data.plain().employees;
      }).catch(function (response) {
        ToastService.showError(MESSAGES.imposibleToFetch + 'empleados. ' + response);
      });
    }

    /**
     * Initialize list view.
     */
    function initListView() {
      //nothing
    }

    /**
     * Initialize screen size watchers to change views depends on the screen size.
     */
    function initScreenResizeWatchers() {
      // Watch screen size to change view modes
      $scope.$watch(function () {
        return $mdMedia('xs');
      }, function (current, old) {
        if (angular.equals(current, old)) {
          return;
        }

        if (current) {
          vm.currentView = views.classic;
        }
      });

      $scope.$watch(function () {
        return $mdMedia('gt-xs');
      }, function (current, old) {
        if (angular.equals(current, old)) {
          return;
        }
        if (current) {
          if (vm.defaultView.name === 'outlook') {
            vm.currentView = views.outlook;
          }
        }
      });
    }

    /**
     * Request for items.
     */
    function fetchItems() {
      vm.ui.loadingItems = true;
      vm.currentItem = null;

      var employee_id = _.find(vm.employees, function (employee) {
        return employee.personnel_file == vm.filterForm.personnel_file;
      }).id;
      var year = vm.filterForm.year;
      var month = vm.filterForm.month;

      var includes = '{__all: true, work: {id: true, name: true, employee: false}, employee: false}';

      vm.filters = {
        'filter[where][employee_id]': employee_id,
        'filter[where][period_year]': year,
        'filter[where][period_month]': month,
        'includes': includes,
        'sort[by]': 'date',
        'sort[order]': 'ASC'
      };
      DailyReportsService.index(vm.filters).then(function (response) {
        var dailyReports = response.data.plain().daily_reports;
        vm.items = HistoryService.makeHistory(dailyReports);
        // Initialize daily reports summary
        vm.dailyReportsSummary = SummaryService.makeDailyReportsSummary(dailyReports);
        vm.ui.loadingItems = false;
      }).catch(function (response) {
        ToastService.showError(MESSAGES.imposibleToFetch + 'reporte. ' + response);
      });

      ReportsService.employee_hours(vm.filters).then(function (items) {
        var responseItems = items.data.plain();
        vm.employeeHours = responseItems.items;
        vm.totals = responseItems.totals;
        vm.ui.loadingItems = false;
      }).catch(function (response) {
        ToastService.showError(MESSAGES.imposibleToFetch + 'reporte. ' + response);
      });
    }

    function collapseAndExpandDate(item) {
      item.expanded = !item.expanded;
    }

    function openClosePeriodDialog(event, open) {
      if (event) {
        event.stopPropagation();
      }
      var callback = function () {
        // TODO: callback
      };
      if (
        vm.filterForm.year
        && vm.filterForm.personnel_file
        && vm.filterForm.month
        && typeof open === 'boolean'
      ) {
        var employee = getEmployeeByPFile(vm.filterForm.personnel_file);
        var period_object = {
          period_year: vm.filterForm.year,
          period_month: vm.filterForm.month
        };
        $mdDialog.show({
          controller: 'TogglePeriodDialogController',
          controllerAs: 'vm',
          templateUrl: 'app/main/reports/period_per_employee/dialogs/toggle_period/toggle-period-dialog.html',
          parent: angular.element($document.find('#content-container')),
          targetEvent: event,
          locals: {
            period: period_object,
            open: open,
            employee: employee,
            callback: callback
          }
        });
      }
    }

    function openXLSExportDialog(event) {
      if (event) {
        event.stopPropagation();
      }

      $mdDialog.show({
        controller: 'XLSPeriodPerEmployeeDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/reports/period_per_employee/dialogs/xls_export/xls_export-dialog.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: event,
        locals: {
          filters: vm.filterForm
        }
      })
    }

    // ########################################## UTILS
    function parseMinutes (minutes) {
      return {
        hours: Math.floor(minutes / 60),
        minutes: minutes % 60
      }
    }

    function getEmployeeByPFile (personnelFile) {
      return _.find(vm.employees, function (employee) {
        return employee.personnel_file == personnelFile;
      });
    }
  }
})();
