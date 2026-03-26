(function () {
  'use strict';

  angular.module('app.reports').controller('DailyReportsPerWorkController', DailyReportsPerWorkController);

  /** @ngInject */
  function DailyReportsPerWorkController(
    MESSAGES,
    DTDefaultOptions,
    ToastService,
    ReportsService,
    EmployeesService,
    WorksService,
    $rootScope,
    $scope,
    $mdMedia,
    $mdDialog,
    $document,
    $log
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
    vm.items = null;

    vm.collapseAndExpandDate = collapseAndExpandDate;

    init();

    // #################  UI FUNCTIONS
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

    // #################  CONTROLLER FUNCTIONS

    function init() {
      vm.ui = {};
      vm.role = $rootScope.currentUser.role;
      vm.current_year = currentYear;
      initTable();
      initFilters();
      initListView();
      fetchEmployees();
      fetchWorks();
      initScreenResizeWatchers();
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
      return EmployeesService.index()
        .then(function (response) {
          vm.employees = response.data.plain().employees;
        })
        .catch(function (response) {
          ToastService.showError(MESSAGES.imposibleToFetch + 'empleados. ' + response);
        });
    }

    function fetchWorks() {
      return WorksService.index({
        'sort[by]': 'id',
        'sort[order]': 'DESC',
        'includes': '{ id:true, name:true, active:true, awarded_at:true, created_at:true,' +
          'work_state: {name:true, color:true}}'
      })
        .then(function (response) {
          vm.works = response.data.plain().works;
        })
        .catch(function (response) {
          ToastService.showError(MESSAGES.imposibleToFetch + 'obras. ' + response);
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

      var from_year = vm.filterForm.year;
      var from_month = vm.filterForm.month;
      // TODO: get date, from date component
      var to_year = 2018;
      var to_month = 3;
      var employee_id = null;
      var work_id = vm.filterForm.work_id;

      if (vm.filterForm.personnel_file) {
        employee_id = _.find(vm.employees, function (employee) {
          return employee.personnel_file == vm.filterForm.personnel_file;
        }).id;
      }

      vm.filters = {
        'filter[where][employee_id]': employee_id,
        'filter[where][work_id]': work_id,
        'filter[where][from_period_year]': from_year,
        'filter[where][from_period_month]': from_month,
        'filter[where][to_period_year]': to_year,
        'filter[where][to_period_month]': to_month,
        'includes': '{__all: true, work: {id: true, name: true, employee: false}, employee: false}'
      };

      ReportsService.dailyReportsPerWork(vm.filters)
        .then(function (items) {
          vm.items = items.data.plain();
          $log.info(vm.items);
          vm.ui.loadingItems = false;
        })
        .catch(function (response) {
          ToastService.showError(MESSAGES.imposibleToFetch + 'reporte. ' + response);
        });
    }

    function collapseAndExpandDate(item) {
      item.expanded = !item.expanded;
    }

    // ############ UTILS ############
    function parseMinutes (minutes) {
      return {
        hours: Math.floor(minutes / 60),
        minutes: minutes % 60
      }
    }
  }
})();
