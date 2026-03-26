(function () {
  'use strict';

  angular.module('app.reports').controller('AcumController', AcumController);

  /** @ngInject */
  function AcumController(
    DTOptionsBuilder,
    DTDefaultOptions,
    ReportsService,
    WorkTypesService,
    WorkGroupsService,
    WorkStatesService,
    CustomersService,
    EmployeeAreasService,
    EmployeesService,
    $scope,
    $rootScope,
    $timeout,
    $mdMedia,
    $mdDialog,
    $document,
    $log
  ) {
    var vm = this;
    var currentYear = (new Date()).getFullYear();
    var views = {};
    var default_filters = {
      'filter[where][period_year]': currentYear
    };

    vm.changeView = changeView;
    vm.fetchItems = fetchItems;
    vm.searchClick = searchClick;
    vm.selectAllWorkStates = selectAllWorkStates;
    vm.openXLSExportDialog = openXLSExportDialog;

    init();

    // ####################################  UI FUNCTIONS
    function searchClick() {
      vm.filters = angular.copy(default_filters);
      vm.filters['filter[where][period_year]'] = vm.filterForm.year;

      if (vm.filterForm.work_id > 0) {
        vm.filters['filter[where][work_id]'] = vm.filterForm.work_id;
        vm.filterForm.work_type_id = 0;
        vm.filterForm.work_group_id = 0;
        vm.filterForm.work_state_ids = [];
        vm.filterForm.customer_id = 0;
        vm.filterForm.employee_id = 0;
        vm.filterForm.speciality_employee_area_id = 0;
        vm.filterForm.employee_employee_area_id = 0;
        vm.filterForm.active = -1;
      } else {
        if (vm.filterForm.work_type_id > 0) {
          vm.filters['filter[where][work_type_id]'] = vm.filterForm.work_type_id;
        }
        if (vm.filterForm.work_group_id > 0) {
          vm.filters['filter[where][work_group_id]'] = vm.filterForm.work_group_id;
        }
        if (
          vm.filterForm.work_state_ids &&
          vm.filterForm.work_state_ids.length > 0
        ) {
          vm.filters['filter[where][work_state_ids][]'] = vm.filterForm.work_state_ids;
        }
        if (vm.filterForm.customer_id > 0) {
          vm.filters['filter[where][customer_id]'] = vm.filterForm.customer_id;
        }
        if (vm.filterForm.employee_id > 0) {
          vm.filters['filter[where][employee_id]'] = vm.filterForm.employee_id;
        }
        if (vm.filterForm.speciality_employee_area_id > 0) {
          vm.filters['filter[where][speciality_employee_area_id]'] = vm.filterForm.speciality_employee_area_id;
        }
        if (vm.filterForm.employee_employee_area_id > 0) {
          vm.filters['filter[where][employee_employee_area_id]'] = vm.filterForm.employee_employee_area_id;
        }
        if (vm.filterForm.active > -1) {
          vm.filters['filter[where][active]'] = vm.filterForm.active;
        }
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
      vm.role = $rootScope.currentUser.role;
      vm.ui = {};
      vm.current_year = currentYear;
      initTable();
      initFilters();
      initListView();
      initScreenResizeWatchers();
    }

    function initTable() {
      var oLanguage = {
        "sProcessing": "Procesando...",
        "sLengthMenu": "Mostrar _MENU_ registros",
        "sZeroRecords": "No se encontraron resultados",
        "sEmptyTable": "Ningún dato disponible en esta tabla",
        "sInfo": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
        "sInfoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
        "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
        "sInfoPostFix": "",
        "sSearch": "Buscar: ",
        "sUrl": "",
        "sInfoThousands": ".",
        "sLoadingRecords": "Cargando...",
        "oPaginate": {
          "sFirst": "Primero",
          "sLast": "Último",
          "sNext": "Siguiente",
          "sPrevious": "Anterior"
        },
        "oAria": {
          "sSortAscending": ": Activar para ordenar la columna de manera ascendente",
          "sSortDescending": ": Activar para ordenar la columna de manera descendente"
        }
      };

      DTDefaultOptions.setLoadingTemplate('<div>Cargando registros...</div>');
      vm.dtInstance = {};
      vm.dtOptions = DTOptionsBuilder.newOptions()
        .withDOM('rt<"bottom"<"left"<"length"l>><"right"<"info"i><"pagination"p>>>')
        .withPaginationType('simple')
        .withDisplayLength(500)
        .withOption('responsive', true)
        .withOption('scrollY', 'auto')
        .withOption('lengthMenu', [50, 100, 500, 1000, 10000])
        .withOption('drawCallback', function () {
          // Use `$timeout` in order to ensure everything is rendered before computing
          $timeout(function () {
            $log.debug(vm.dtInstance);
          }, 0);
        })
        .withLanguage(oLanguage);
      // .withTableToolsButtons([
      //   'copy',
      //   'print', {
      //     'sExtends': 'collection',
      //     'sButtonText': 'Save',
      //     'aButtons': ['csv', 'xls', 'pdf']
      //   }
      // ])
    }

    function initFilters() {
      vm.filters = angular.copy(default_filters);

      vm.filterInputs = {};
      vm.filterForm = {
        year: currentYear,
        work_id: null,
        work_type_id: null,
        work_group_id: null,
        work_state_ids: [],
        customer_id: null,
        employee_id: null,
        speciality_employee_area_id: null,
        employee_employee_area_id: null,
        type: 2,
        active: null
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

      EmployeeAreasService.index({
        includes: '{ id: true, name: true, active: true }'
      })
        .then(function (response) {
          vm.filterInputs.employee_areas = response.data.plain().employee_areas;
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

    function selectAllWorkStates() {
      if(vm.filterForm.work_state_ids.length === vm.filterInputs.work_states.length) {
        vm.filterForm.work_state_ids = [];
      } else {
        vm.filterForm.work_state_ids = vm.filterInputs.work_states.map(function(item) { return item.id });
      }
    }

    function openXLSExportDialog(event, type) {
      if (event) {
        event.stopPropagation();
      }

      $mdDialog.show({
        controller: 'XLSAcumDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/reports/acum/xls_export/xls_export-dialog.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: event,
        locals: {
          filters: vm.filterForm,
          type: type
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

      ReportsService.acum(vm.filters)
        .then(function (items) {
          var responseItems = items.data.plain();

          vm.items = responseItems.items;
          vm.totals = responseItems.totals;
          vm.total_works = responseItems.total_works;

          vm.selectedType = vm.filterForm.type;
          vm.ui.loadingItems = false;
        })
        .catch(function (response) {
          $log.error(response);
        });
    }

    // ########################################## UTILS
  }
})();
