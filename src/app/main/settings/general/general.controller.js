(function () {
  'use strict';

  angular.module('app.settings').controller('GeneralController', GeneralController);

  /** @ngInject */
  function GeneralController(MESSAGES, WorkGroupsService, WorkStatesService, WorkTypesService, EmployeeAreasService, EmployeeHourTypesService, EmployeePositionsService, SpecialitiesService, PlacesService, ActivitiesService, $scope, $rootScope, $state, $mdMedia, $mdDialog, $document, $log) {
    var vm = this;

    vm.changeView = changeView;
    vm.openItem = openItem;
    vm.closeItem = closeItem;
    vm.collapseAndExpandItem = collapseAndExpandItem;
    vm.openWorkGroupDialog = openWorkGroupDialog;
    vm.openWorkStateDialog = openWorkStateDialog;
    vm.openWorkTypeDialog = openWorkTypeDialog;
    vm.openEmployeeAreaDialog = openEmployeeAreaDialog;
    vm.openEmployeeCategoryDialog = openEmployeeCategoryDialog;
    vm.openEmployeeHourTypeDialog = openEmployeeHourTypeDialog;
    vm.openEmployeePositionDialog = openEmployeePositionDialog;
    vm.openPlaceDialog = openPlaceDialog;
    vm.openActivityDialog = openActivityDialog;
    vm.openSpecialityDialog = openSpecialityDialog;

    init();

    //////// CONTROLLER FUNCTIONS
    function init() {
      vm.role = $rootScope.currentUser.role;
      fetchItems();

      vm.views = {
        classic: 'app/main/settings/general/views/classic/classic-view.html',
        outlook: 'app/main/settings/general/views/outlook/outlook-view.html'
      };
      vm.defaultView = 'outlook';
      vm.currentView = 'outlook';
      vm.currentItem = null;
      vm.selectedItems = [];

      // Watch screen size to change view modes
      $scope.$watch(function ()
      {
        return $mdMedia('xs');
      }, function (current, old)
      {
        if ( angular.equals(current, old) )
        {
          return;
        }

        if ( current )
        {
          vm.currentView = 'classic';
        }
      });

      $scope.$watch(function ()
      {
        return $mdMedia('gt-xs');
      }, function (current, old)
      {
        if ( angular.equals(current, old) )
        {
          return;
        }

        if ( current )
        {
          if ( vm.defaultView === 'outlook' )
          {
            vm.currentView = 'outlook';
          }
        }
      });
    }

    function fetchItems() {
      vm.items = [
        {
          id: 'work_groups',
          name: 'Grupos de obras',
          description: 'Define los distintos grupos para obras',
          detailView: {
            classic: 'app/main/settings/general/views/classic/detail/work-groups-detail.html',
            outlook: 'app/main/settings/general/views/outlook/detail/work-groups-detail.html'
          },
          init: fetchWorkGroups,
          content: {}
        },
        {
          id: 'work_states',
          name: 'Estados de obras',
          description: 'Define los distintos estados para obras',
          detailView: {
            classic: 'app/main/settings/general/views/classic/detail/work-states-detail.html',
            outlook: 'app/main/settings/general/views/outlook/detail/work-states-detail.html'
          },
          init: fetchWorkStates,
          content: {}
        },
        {
          id: 'WorkTypes',
          name: 'Tipos de obras',
          description: 'Define los distintos tipos de obras',
          detailView: {
            classic: 'app/main/settings/general/views/classic/detail/work-types-detail.html',
            outlook: 'app/main/settings/general/views/outlook/detail/work-types-detail.html'
          },
          init: fetchWorkTypes,
          content: {}
        },
        {
          id: 'employee_areas_and_specialities',
          name: 'Areas y Especialidades',
          description: 'Define las distintas areas de trabajo para empleados y las especialidades',
          detailView: {
            classic: 'app/main/settings/general/views/classic/detail/employee-areas-and-specialities-detail.html',
            outlook: 'app/main/settings/general/views/outlook/detail/employee-areas-and-specialities-detail.html'
          },
          init: fetchEmployeeAreas,
          content: {}
        },
        {
          id: 'employee_hour_types',
          name: 'Tipos de horas',
          description: '',
          detailView: {
            classic: 'app/main/settings/general/views/classic/detail/employee-hour-types-detail.html',
            outlook: 'app/main/settings/general/views/outlook/detail/employee-hour-types-detail.html'
          },
          init: fetchEmployeeHourTypes,
          content: {}
        },
        {
          id: 'employee_positions_and_employee_categories',
          name: 'Puestos y Categorias',
          description: 'Define los distintos puestos para empleados, y las categorias para cada puesto',
          detailView: {
            classic: 'app/main/settings/general/views/classic/detail/employee-positions-and-employee-categories-detail.html',
            outlook: 'app/main/settings/general/views/outlook/detail/employee-positions-and-employee-categories-detail.html'
          },
          init: fetchEmployeePositions,
          content: {}
        },
        {
          id: 'places',
          name: 'Lugares',
          description: 'Define los distintos lugares para los partes de obra',
          detailView: {
            classic: 'app/main/settings/general/views/classic/detail/places-detail.html',
            outlook: 'app/main/settings/general/views/outlook/detail/places-detail.html'
          },
          init: fetchPlaces,
          content: {}
        },
        {
          id: 'activities',
          name: 'Actividades',
          description: 'Define las distintas actividades',
          detailView: {
            classic: 'app/main/settings/general/views/classic/detail/activities-detail.html',
            outlook: 'app/main/settings/general/views/outlook/detail/activities-detail.html'
          },
          init: fetchActivities,
          content: {}
        }
      ];
    }

    function fetchWorkGroups() {
      $rootScope.loadingProgress = true;
      WorkGroupsService.index().then(function (response) {
        vm.currentItem.content.items = response.data.plain().work_groups;
        $rootScope.loadingProgress = false;
      }).catch(function (response) {
        $log.error(response);
      });
    }

    function fetchWorkStates() {
      $rootScope.loadingProgress = true;
      WorkStatesService.index().then(function (response) {
        vm.currentItem.content.items = response.data.plain().work_states;
        $rootScope.loadingProgress = false;
      }).catch(function (response) {
        $log.error(response);
      });
    }

    function fetchWorkTypes() {
      $rootScope.loadingProgress = true;
      WorkTypesService.index().then(function (response) {
        vm.currentItem.content.items = response.data.plain().work_types;
        $rootScope.loadingProgress = false;
      }).catch(function (response) {
        $log.error(response);
      });
    }

    function fetchEmployeeAreas() {
      $rootScope.loadingProgress = true;
      EmployeeAreasService.index().then(function (response) {
        vm.currentItem.content.items = response.data.plain().employee_areas;
        $rootScope.loadingProgress = false;
      }).catch(function (response) {
        $log.error(response);
      });
    }

    function fetchEmployeeHourTypes() {
      $rootScope.loadingProgress = true;
      EmployeeHourTypesService.index().then(function (response) {
        vm.currentItem.content.items = response.data.plain().employee_hour_types;
        $rootScope.loadingProgress = false;
      }).catch(function (response) {
        $log.error(response);
      });
    }

    function fetchEmployeePositions() {
      $rootScope.loadingProgress = true;
      EmployeePositionsService.index().then(function (response) {
        vm.currentItem.content.items = response.data.plain().employee_positions;
        $rootScope.loadingProgress = false;
      }).catch(function (response) {
        $log.error(response);
      });
    }

    function fetchPlaces() {
      $rootScope.loadingProgress = true;
      PlacesService.index().then(function (response) {
        vm.currentItem.content.items = response.data.plain().places;
        $rootScope.loadingProgress = false;
      }).catch(function (response) {
        $log.error(response);
      });
    }

    function fetchActivities() {
      $rootScope.loadingProgress = true;
      ActivitiesService.index().then(function (response) {
        vm.currentItem.content.items = response.data.plain().activities;
        $rootScope.loadingProgress = false;
      }).catch(function (response) {
        $log.error(response);
      });
    }


    ///////// UI FUNCTIONS

    function openWorkGroupDialog(event, item) {
      $mdDialog.show({
        controller         : 'WorkGroupDialogController',
        controllerAs       : 'vm',
        templateUrl        : 'app/main/settings/general/dialogs/work_group/work-group-dialog.html',
        parent             : angular.element($document.find('#content-container')),
        targetEvent        : event,
        locals: {
          item: item,
          callback: fetchWorkGroups
        }
      });
    }

    function openWorkStateDialog(event, item) {
      $mdDialog.show({
        controller         : 'WorkStateDialogController',
        controllerAs       : 'vm',
        templateUrl        : 'app/main/settings/general/dialogs/work_state/work-state-dialog.html',
        parent             : angular.element($document.find('#content-container')),
        targetEvent        : event,
        locals: {
          item: item,
          callback: fetchWorkStates
        }
      });
    }

    function openWorkTypeDialog(event, item) {
      $mdDialog.show({
        controller         : 'WorkTypeDialogController',
        controllerAs       : 'vm',
        templateUrl        : 'app/main/settings/general/dialogs/work_type/work-type-dialog.html',
        parent             : angular.element($document.find('#content-container')),
        targetEvent        : event,
        locals: {
          item: item,
          callback: fetchWorkTypes
        }
      });
    }

    function openEmployeeAreaDialog(event, item) {
      $mdDialog.show({
        controller         : 'EmployeeAreaDialogController',
        controllerAs       : 'vm',
        templateUrl        : 'app/main/settings/general/dialogs/employee_area/employee-area-dialog.html',
        parent             : angular.element($document.find('#content-container')),
        targetEvent        : event,
        locals: {
          item: item,
          callback: fetchEmployeeAreas
        }
      });
    }

    function openSpecialityDialog(event, employeeAreaId, item) {
      $mdDialog.show({
        controller         : 'SpecialityDialogController',
        controllerAs       : 'vm',
        templateUrl        : 'app/main/settings/general/dialogs/speciality/speciality-dialog.html',
        parent             : angular.element($document.find('#content-container')),
        targetEvent        : event,
        locals: {
          employeeAreaId: employeeAreaId,
          item: item,
          callback: fetchEmployeeAreas
        }
      });
    }

    function openEmployeeHourTypeDialog(event, item) {
      $mdDialog.show({
        controller         : 'EmployeeHourTypeDialogController',
        controllerAs       : 'vm',
        templateUrl        : 'app/main/settings/general/dialogs/employee_hour_type/employee-hour-type-dialog.html',
        parent             : angular.element($document.find('#content-container')),
        targetEvent        : event,
        locals: {
          item: item,
          callback: fetchEmployeeHourTypes
        }
      });
    }

    function openEmployeePositionDialog(event, item) {
      $mdDialog.show({
        controller         : 'EmployeePositionDialogController',
        controllerAs       : 'vm',
        templateUrl        : 'app/main/settings/general/dialogs/employee_position/employee-position-dialog.html',
        parent             : angular.element($document.find('#content-container')),
        targetEvent        : event,
        locals: {
          item: item,
          callback: fetchEmployeePositions
        }
      });
    }

    function openEmployeeCategoryDialog(event, employeePositionId, item) {
      $mdDialog.show({
        controller         : 'EmployeeCategoryDialogController',
        controllerAs       : 'vm',
        templateUrl        : 'app/main/settings/general/dialogs/employee_category/employee-category-dialog.html',
        parent             : angular.element($document.find('#content-container')),
        targetEvent        : event,
        locals: {
          employeePositionId: employeePositionId,
          item: item,
          callback: fetchEmployeePositions
        }
      });
    }

    function openPlaceDialog(event, item) {
      $mdDialog.show({
        controller         : 'PlaceDialogController',
        controllerAs       : 'vm',
        templateUrl        : 'app/main/settings/general/dialogs/place/place-dialog.html',
        parent             : angular.element($document.find('#content-container')),
        targetEvent        : event,
        locals: {
          item: item,
          callback: fetchPlaces
        }
      });
    }

    function openActivityDialog(event, item) {
      $mdDialog.show({
        controller         : 'ActivityDialogController',
        controllerAs       : 'vm',
        templateUrl        : 'app/main/settings/general/dialogs/activity/activity-dialog.html',
        parent             : angular.element($document.find('#content-container')),
        targetEvent        : event,
        locals: {
          item: item,
          callback: fetchActivities
        }
      });
    }

    function openItem(item)
    {
      // Assign item as the current item
      vm.currentItem = item;
      vm.currentItem.init();

      $log.debug('current item', vm.currentItem);

      // Update the state without reloading the controller
      $state.go('app.settings.general.item', {id: item.id}, {notify: false});
    }

    function closeItem()
    {
      vm.currentItem = null;

      // Update the state without reloading the controller
      $state.go('app.settings.general', {notify: false});
    }

    function changeView(view)
    {
      if ( vm.views[view] )
      {
        vm.defaultView = view;
        vm.currentView = view;
      }
    }

    function collapseAndExpandItem(item) {
      item.expanded = !item.expanded;
    }
  }
})();
