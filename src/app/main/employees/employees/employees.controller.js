(function () {
  'use strict';

  angular.module('app.employees').controller('EmployeesController', EmployeesController);

  /** @ngInject */
  function EmployeesController(
    MESSAGES,
    ToastService,
    EmployeesService,
    UsersService,
    $scope,
    $rootScope,
    $state,
    $mdMedia,
    $mdDialog,
    $document,
    $log
  ) {
    var vm = this;
    var views = {};
    var default_filters = {
      'sort[by]': 'personnel_file',
      'sort[order]': 'ASC',
      'includes': '{id:true, personnel_file: true, name: true, lastname: true, acronym: true, user: { email: true, active:true}}'
    };

    vm.openItem = openItem;
    vm.closeItem = closeItem;
    vm.openItemDialog = openItemDialog;
    vm.changeView = changeView;
    vm.fetchItems = fetchItems;
    vm.searchClick = searchClick;
    vm.resetPassword = resetPassword;

    init();

    // ####################################  UI FUNCTIONS
    function searchClick() {
      vm.filters = angular.copy(default_filters);

      if (vm.filterForm.id > 0) {
        vm.filters['filter[where][id]'] = vm.filterForm.id;
        vm.filterForm.active = -1;
        vm.filterForm.personnel_file = '';
      } else if (vm.filterForm.personnel_file != '') {
        vm.filters['filter[where][personnel_file]'] = vm.filterForm.personnel_file;
        vm.filterForm.active = -1;
        vm.filterForm.id = 0;
      } else {
        if (vm.filterForm.per_page > 0) {
          vm.filters['pagination[page]'] = 1;
          vm.filters['pagination[per_page]'] = vm.filterForm.per_page;
        }

        if (vm.filterForm.active > -1) {
          vm.filters['filter[where][active]'] = vm.filterForm.active;
        }
      }

      fetchItems();
    }

    function openItemDialog(event, item) {
      if (event) {
        event.stopPropagation();
      }

      $mdDialog.show({
        controller: 'EmployeeDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/employees/employees/dialogs/employee/employee-dialog.html',
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
      EmployeesService.show(id)
        .then(function (response) {
          vm.currentItem = response.data.plain().employee;
          vm.currentItem.user.role_nice_name = parseRole(vm.currentItem.user.role);

          vm.ui.loadingCurrentItem = false;
          // Update the state without reloading the controller
          $state.go('app.employees.employees.employee', { id: id }, { notify: false });
        }).catch(function (response) {
          ToastService.showError(MESSAGES.imposibleToFetchOne + 'empleado');
          $log.error(response);
        });
    }

    /**
     * Close current item.
     */
    function closeItem() {
      vm.currentItem = null;

      // Update the state without reloading the controller
      $state.go('app.employees.employees', { notify: false });
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
      initFilters();
      initViews();
      initListView();
      initScreenResizeWatchers();
    }

    function initFilters() {
      vm.filters = angular.copy(default_filters);

      vm.filterInputs = {};
      vm.filterForm = {
        per_page: 0,
        id: '',
        active: -1,
        personnel_file: ''
      };
    }

    function initViews() {
      views = {
        classic: {
          name: 'classic',
          url: 'app/main/employees/employees/views/classic/classic-view.html'
        },
        outlook: {
          name: 'outlook',
          url: 'app/main/employees/employees/views/outlook/outlook-view.html'
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
     * Request for items.
     */
    function fetchItems() {
      vm.ui.loadingItems = true;
      vm.currentItem = null;

      EmployeesService.index(vm.filters).then(function (items) {
        vm.items = items.data.plain().employees;

        // Set items counts
        if (items.data.plain().meta && items.data.plain().meta.count) {
          vm.items_total_count = items.data.plain().meta.count;
        } else {
          vm.items_total_count = vm.items.length;
        }

        vm.ui.loadingItems = false;

        // Open the item if needed
        if ($state.params.id) {
          vm.openItem($state.params.id);
        }
      }).catch(function (response) {
        $log.error(response);
      });
    }

    function resetPassword(event, currentItem) {
      if (event) {
        event.stopPropagation();
      }

      var confirm = $mdDialog.confirm()
        .title(MESSAGES.areYouSureToResetPassword)
        .targetEvent(event).ok(MESSAGES.yes).cancel(MESSAGES.no);

      $mdDialog.show(confirm).then(function () {
        UsersService.resetPassword(currentItem.id).then(function () {
          ToastService.show(MESSAGES.passwordResetSucessfuly);
          reOpenCurrentItem();
        }).catch(function () {
          ToastService.showError(MESSAGES.imposibbleToResetPassword);
        });
      });
    }

    // ########################################## UTILS
    function parseRole(role) {
      switch (role) {
        case 'UserEmployee':
          return 'Empleado';
        case 'UserProjectLeader':
          return 'Líder de Proyecto';
        case 'UserAdministrativeAssistant':
          return 'Auxiliar de Administración';
        case 'UserHumanResource':
          return 'Recursos Humanos';
        case 'UserAreaChief':
          return 'Jefe de Área';
        case 'UserCoordinator':
          return 'Coordinador';
        case 'UserAuxiliaryCoordinator':
          return 'Coordinador Auxiliar';
        case 'UserManager':
          return 'Gerente';
        case 'UserAdmin':
          return 'Admin';
        default:
          return role;
      }
    }
  }
})();
