(function () {
  'use strict';

  angular.module('app.works').controller('WorksController', WorksController);

  /** @ngInject */
  function WorksController(
    WorksService,
    WorksReportsService,
    SummaryService,
    ChartService,
    WorkTypesService,
    WorkGroupsService,
    WorkStatesService,
    ReportsService,
    CustomersService,
    EmployeesService,
    DTOptionsBuilder,
    $scope,
    $rootScope,
    $state,
    $timeout,
    $interval,
    $mdMedia,
    $mdDialog,
    $document,
    $log
  ) {
    var vm = this;
    var views = {};
    var default_filters = {
      'sort[by]': 'id',
      'sort[order]': 'DESC',
      'includes': '{id:true, name:true, active:true, awarded_at:true, created_at:true, employees: true, has_work_quotations: true, work_state: {name:true, color:true}, customer:{name:true}}'
    };

    vm.openItem = openItem;
    vm.closeItem = closeItem;
    vm.openItemDialog = openItemDialog;
    vm.openXLSExportDialog = openXLSExportDialog;
    vm.changeView = changeView;
    vm.fetchItems = fetchItems;
    vm.openWorkQuotationDialog = openWorkQuotationDialog;
    vm.collapseAndExpandWorkQuotation = collapseAndExpandWorkQuotation;
    vm.parseMinutes = parseMinutes;
    vm.sumPositiveSpecialitiesHours = sumPositiveSpecialitiesHours;
    vm.sumNegativeSpecialitiesHours = sumNegativeSpecialitiesHours;
    vm.getMonthName = getMonthName;
    vm.searchClick = searchClick;
    vm.hoursBySpecSearchClick = hoursBySpecSearchClick;

    vm.dailyRepDTInstanceCallback = dailyRepDTInstanceCallback;
    vm.dailyReportsDTInstance = {};
    vm.dailyReportSumMinutes = 0;
    vm.dailyReportSumCost = 0;

    init();

    // ####################################  UI FUNCTIONS
    function searchClick() {
      vm.closeItem();
      vm.filters = angular.copy(default_filters);

      if (vm.filterForm.id > 0) {
        vm.filters['filter[where][id]'] = vm.filterForm.id;
        vm.filterForm.work_type_id = 0;
        vm.filterForm.work_group_id = 0;
        vm.filterForm.work_state_id = 0;
        vm.filterForm.customer_id = 0;
        vm.filterForm.employee_id = 0;
        vm.filterForm.active = -1;
      }
      else {
        if (vm.filterForm.per_page > 0) {
          vm.filters['pagination[page]'] = 1;
          vm.filters['pagination[per_page]'] = vm.filterForm.per_page;
        }
        if (vm.filterForm.work_type_id > 0) {
          vm.filters['filter[where][work_type_id]'] = vm.filterForm.work_type_id;
        }
        if (vm.filterForm.work_group_id > 0) {
          vm.filters['filter[where][work_group_id]'] = vm.filterForm.work_group_id;
        }
        if (vm.filterForm.work_state_id > 0) {
          vm.filters['filter[where][work_state_id]'] = vm.filterForm.work_state_id;
        }
        if (vm.filterForm.customer_id > 0) {
          vm.filters['filter[where][customer_id]'] = vm.filterForm.customer_id;
        }
        if (vm.filterForm.employee_id > 0) {
          vm.filters['filter[where][employee_id]'] = vm.filterForm.employee_id;
        }
        if (vm.filterForm.active > -1) {
          vm.filters['filter[where][active]'] = vm.filterForm.active;
        }
      }

      fetchItems();
    }

    function openWorkQuotationDialog(event, item) {
      if (event) {
        event.stopPropagation();
      }

      $mdDialog.show({
        controller: 'WorkQuotationDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/works/dialogs/work_quotation/work-quotation-dialog.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: event,
        locals: {
          work_id: vm.currentItem.id,
          item: item,
          quotesSummary: angular.copy(vm.quotesSummary),
          callback: fetchWorkQuotations
        }
      });
    }

    function openItemDialog(event, item) {
      if (event) {
        event.stopPropagation();
      }

      $mdDialog.show({
        controller: 'WorkDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/works/dialogs/work/work-dialog.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: event,
        locals: {
          item: item,
          callback: item != null ? reOpenCurrentItem : fetchItems,
          callback_after_remove: function () {
            _.remove(vm.items, function (item) {
              return item.id == vm.currentItem.id;
            });
            closeItem();
          }
        }
      })
    }

    function reOpenCurrentItem() {
      openItem(vm.currentItem.id);
    }

    /**
     * Open the selected item, and request for full information against the api.
     * @param id the item unique identifier
     */
    function openItem(id) {
      vm.ui.loadingCurrentItem = true;
      WorksService.show(id)
        .then(function (response) {
          vm.currentItem = response.data.plain().work;
          initItemDetails();
          vm.ui.loadingCurrentItem = false;

          // Update the state without reloading the controller
          $state.go('app.works.works.work', { id: id }, { notify: false });
        })
        .catch(function (response) {
          $log.error(response);
        });
    }

    /**
     * Close current item.
     */
    function closeItem() {
      vm.currentItem = null;

      // Update the state without reloading the controller
      $state.go('app.works.works', { notify: false });
    }

    function changeView(viewName) {
      if (views[viewName]) {
        vm.defaultView = views[viewName];
        vm.currentView = views[viewName];
      }

      vm.currentView = views[viewName];
      vm.currentItem = null;
    }

    function collapseAndExpandWorkQuotation(workQuotation) {
      workQuotation.expanded = !workQuotation.expanded;
    }

    function openXLSExportDialog(event) {
      if (event) {
        event.stopPropagation();
      }

      $mdDialog.show({
        controller: 'XLSExportDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/works/dialogs/xls_export/xls_export-dialog.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: event,
        locals: {
          filters: vm.filterForm
        }
      })
    }

    // ####################################  CONTROLLER FUNCTIONS

    function init() {
      vm.role = $rootScope.currentUser.role;
      vm.ui = {};
      initFilters();
      initViews();
      initListView();
      initScreenResizeWatchers();
      initDailyReportsDataTable();
      vm.chart = ChartService.initChart();
    }

    function initFilters() {
      var currentDate = new Date();

      vm.filters = angular.copy(default_filters);
      vm.filters['pagination[page]'] = 1;
      vm.filters['pagination[per_page]'] = 50;
      vm.filterInputs = {};

      vm.filterForm = {
        per_page: 50,
        work_type_id: 0,
        work_group_id: 0,
        work_state_id: 0,
        customer_id: 0,
        employee_id: 0,
        id: '',
        active: -1,
        month: currentDate.getMonth(),
        year: currentDate.getFullYear()
      };

      WorkTypesService.index()
        .then(function (response) {
          vm.filterInputs.work_types = response.data.plain().work_types;
        })
        .catch(function (response) {
          $log.error(response);
        });

      WorkGroupsService.index()
        .then(function (response) {
          vm.filterInputs.work_groups = response.data.plain().work_groups;
        })
        .catch(function (response) {
          $log.error(response);
        });

      WorkStatesService.index()
        .then(function (response) {
          vm.filterInputs.work_states = response.data.plain().work_states;
        })
        .catch(function (response) {
          $log.error(response);
        });

      CustomersService.index()
        .then(function (response) {
          vm.filterInputs.customers = response.data.plain().customers;
        })
        .catch(function (response) {
          $log.error(response);
        });

      EmployeesService.worksResponsibles({
        includes: '{ id: true, acronym: true, name: true, lastname: true, user: { active: true } }'
      })
        .then(function (response) {
          vm.filterInputs.employees = response.data.plain().employees;
        })
        .catch(function (response) {
          $log.error(response);
        });
    }

    function initViews() {
      views = {
        classic: {
          name: 'classic',
          url: 'app/main/works/views/classic/classic-view.html'
        },
        outlook: {
          name: 'outlook',
          url: 'app/main/works/views/outlook/outlook-view.html'
        }
      };
      vm.defaultView = views['classic'];
      changeView('classic');
    }

    /**
     * Initialize list view.
     */
    function initListView() {
      fetchItems();
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
     * Initialize daily reports data table
     */
    function initDailyReportsDataTable() {
      // TODO: fix this
      // If I install these plugins it works, but not completely
      // bower install datatables.net-buttons --save
      // bower install datatables.net-buttons-dt --save
      // vm.dailyReportsDtOptions = {
      var options = {
        dom: '<"top"f>rt<"bottom"<"left"<"length"l>><"right"<"info"i><"pagination"p>>>',
        // dom: 'Bfrtip',
        // dom: '<"prev"B<"top"f>>rt<"bottom"<"left"<"length"l>><"right"<"info"i><"pagination"p>>>',
        pagingType: 'simple',
        lengthMenu: [50, 100, 500, 1000, 10000],
        pageLength: 500,
        autoWidth: false,
        responsive: true,
        buttons: [
          'columnsToggle',
          'colvis',
          'copy',
          'print',
          'excel'
        ]
      };

      vm.dailyReportsDtOptions = DTOptionsBuilder.newOptions(options)
        // .withDisplayLength(3)
        .withOption('drawCallback', function () {
          // Use `$timeout` in order to ensure everything is rendered before computing
          $timeout(function () {
            calcValues();
          }, 500);
        });
    }

    function dailyRepDTInstanceCallback (dtInstance) {
      vm.dailyReportsDTInstance = dtInstance;
    }

    function calcValues () {
      var displayedRows = vm.dailyReportsDTInstance.dataTable._('tr', { filter: 'applied', page: 'current' });
      vm.dailyReportSumMinutes = 0;
      vm.dailyReportSumCost = 0.0;
      angular.forEach(displayedRows, function (row) {
        if (row[2]) {
          var auxMin = Number(row[2]);
          if (angular.isNumber(auxMin)) {
            vm.dailyReportSumMinutes += auxMin;
          }
        }
        if (row[3]) {
          var auxCost = parseFloat(row[3].replace(/\./g, 'A').replace(/,/g, '.').replace(/A/g, ''));
          if (angular.isNumber(auxCost)) {
            vm.dailyReportSumCost += auxCost;
          }
        }
      });
    }

    /**
     * Initialize item details.
     */
    function initItemDetails() {
      // Initialize daily reports summary
      vm.dailyReportsSummary = SummaryService.makeDailyReportsSummary(vm.currentItem.daily_reports);

      // Initialize number of employees that have assigned ours widget
      vm.numberOfEmployeesThatAssignHours = SummaryService.getNumberOfEmployeesThatAssignHours(vm.currentItem.daily_reports);

      if (
        vm.role == 'UserAdmin'
        || vm.role == 'UserAreaChief'
        || vm.role == 'UserCoordinator'
        || vm.role == 'UserManager'
        || vm.role == 'UserAuxiliaryCoordinator'
        || vm.role == 'UserProjectLeader') {
        // Inititialize work quotations summary
        vm.quotesSummary = SummaryService.makeQuotesSummary(vm.currentItem.work_quotations);

        // Initialize chart with data
        vm.chart.mainChart.data = ChartService.makeDataForChart(vm.quotesSummary, vm.dailyReportsSummary);
      }
    }

    /**
     * Request for items.
     */
    function fetchItems() {
      vm.ui.loadingItems = true;
      vm.currentItem = null;

      WorksService.index(vm.filters)
        .then(function (items) {
          vm.items = items.data.plain().works;

          // Set items counts
          if (items.data.plain().meta && items.data.plain().meta.count) {
            vm.items_total_count = items.data.plain().meta.count;
          }
          else {
            vm.items_total_count = vm.items.length;
          }

          vm.ui.loadingItems = false;

          // Open the item if needed
          if ($state.params.id) {
            vm.openItem($state.params.id);
          }
        })
        .catch(function (response) {
          $log.error(response);
        });
    }

    function fetchWorkQuotations() {
      WorksService.workQuotations(vm.currentItem.id)
        .then(function (response) {
          vm.currentItem.work_quotations = response.data.plain().work_quotations;
          initItemDetails();
        })
        .catch(function (response) {
          $log.error(response);
        });
    }

    // ################# Hours by Speciality ##############
    function hoursBySpecSearchClick() {
      if (vm.filterForm.year && vm.filterForm.month) {
        fetchHoursBySpec({
          'filter[where][work_id]': vm.currentItem.id,
          'filter[where][period_year]': vm.filterForm.year,
          'filter[where][period_month]': vm.filterForm.month
        });
      }
    }

    function fetchHoursBySpec(filters) {
      // vm.currentItem = null;
      ReportsService.hours_by_speciality(filters)
        .then(function (items) {
          vm.hoursBySpec = items.data.plain();
        })
        .catch(function (response) {
          $log.error(response);
        });
    }
    // ########################################## UTILS

    function parseMinutes(minutes) {
      var h = Math.floor(minutes / 60);
      var m = minutes % 60;
      return { hours: h, minutes: m }
    }

    function sumPositiveSpecialitiesHours(workQuotation) {
      var total = 0;
      _.forEach(workQuotation.work_quotation_specialities, function (o) {
        if (o.hours > 0) {
          total += o.hours;
        }
      });
      return total;
    }

    function sumNegativeSpecialitiesHours(workQuotation) {
      var total = 0;
      _.forEach(workQuotation.work_quotation_specialities, function (o) {
        if (o.hours < 0) {
          total += o.hours;
        }
      });
      return total;
    }

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
  }
})();
