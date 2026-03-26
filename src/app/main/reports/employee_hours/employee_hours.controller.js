(function () {
  'use strict';

  angular.module('app.reports').controller('EmployeeHoursController', EmployeeHoursController);

  /** @ngInject */
  function EmployeeHoursController(MESSAGES, DTDefaultOptions, ReportsService, $scope, WorkTypesService, WorkGroupsService, WorkStatesService, $rootScope, $state, $timeout, $mdMedia, $mdDialog, $document, $log) {
    var vm = this;
    var currentYear = (new Date()).getFullYear();
    var currentMonth = (new Date()).getMonth();
    var views = {};
    var default_filters = {
      'filter[where][period_year]' : currentYear,
      'filter[where][period_month]' : currentMonth
    };

    vm.changeView = changeView;
    vm.fetchItems = fetchItems;
    vm.searchClick = searchClick;
    vm.openXLSExportDialog = openXLSExportDialog;

    init();

    // ####################################  UI FUNCTIONS
    function searchClick() {
      vm.filters = angular.copy(default_filters);
      vm.filters['filter[where][period_year]'] = vm.filterForm.year;
      vm.filters['filter[where][period_month]'] = vm.filterForm.month;

      if (vm.filterForm.active > -1) {
        vm.filters['filter[where][active]'] = vm.filterForm.active;
      }

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
      vm.current_year = currentYear;
      initTable();
      initFilters();
      initListView();
      initScreenResizeWatchers();
    }

    function initTable() {
      DTDefaultOptions.setLoadingTemplate('<div>Cargando registros...</div>');
      vm.dtInstance = {};
      vm.dtOptions = {
        dom         : 'rt<"bottom"<"left"<"length"l>><"right"<"info"i><"pagination"p>>>',
        pagingType  : 'simple',
        lengthMenu  : [50, 100, 500, 1000, 10000],
        pageLength  : 10000,
        scrollY     : 'auto',
        responsive  : true
      };
    }

    function initFilters() {
      vm.filters = angular.copy(default_filters);

      vm.filterInputs = {};
      vm.filterForm = {
        year: currentYear,
        month: currentMonth,
        active: -1
      };
    }

    function openXLSExportDialog(event) {
      if (event) {
        event.stopPropagation();
      }

      $mdDialog.show({
        controller: 'XLSEmployeeHoursDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/reports/employee_hours/xls_export/xls_export-dialog.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: event,
        locals: {
          filters: vm.filterForm
        }
      })
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

      ReportsService.employee_hours(vm.filters).then(function (items) {
        var responseItems = items.data.plain();

        vm.items = responseItems.items;
        vm.totals = responseItems.totals;

        vm.ui.loadingItems = false;
      }).catch(function (response) {
        $log.error(response);
      });
    }

    // ########################################## UTILS
  }
})();
