(function () {
  'use strict';

  angular.module('app.employees').controller('EmployeeDialogController', EmployeeDialogController);

  function EmployeeDialogController(
    MESSAGES,
    ToastService,
    UsersService,
    EmployeeHourTypesService,
    EmployeePositionsService,
    EmployeeAreasService,
    $scope,
    $mdDialog,
    item,
    callback,
    callback_after_remove
  ) {
    var vm = this;
    vm.cancel = cancel;
    vm.remove = remove;
    vm.resetForm = resetForm;

    init();

    ///////// CONTROLLER FUNCTIONS
    function init() {
      fetchEmployeePositions();
      fetchEmployeeAreas();
      fetchEmployeeHourTypes();

      vm.item = angular.copy(item);
      vm.new = false;
      vm.save = update;

      if (!vm.item) {
        vm.item = {
          user: {
            active: true
          }
        };
        vm.new = true;
        vm.save = create;
      }

      $scope.$watch('vm.item.employee_category.employee_position.id', function () {
        getEmployeeCategories();
      });
    }

    function getParametersForSave() {
      var params = {};

      if (vm.new) {
        params.email = vm.item.user.email;
        params.active = vm.item.user.active;
        params.role = vm.item.user.role;
        params.employee_attributes = {
          name: vm.item.name,
          lastname: vm.item.lastname,
          acronym: vm.item.acronym,
          personnel_file: vm.item.personnel_file,
          cuil: vm.item.cuil,
          fulltime: vm.item.fulltime,
          employee_hour_type_id: vm.item.employee_hour_type.id,
          employee_category_id: vm.item.employee_category.id,
          employee_area_id: vm.item.employee_area.id
        };
      }
      else {
        params.email = vm.item.user.email != item.user.email ? vm.item.user.email : undefined;
        params.active = vm.item.user.active != item.user.active ? vm.item.user.active : undefined;
        params.role = vm.item.user.role != item.user.role ? vm.item.user.role : undefined;
        params.employee_attributes = {
          name: vm.item.name != item.name ? vm.item.name : undefined,
          lastname: vm.item.lastname != item.lastname ? vm.item.lastname : undefined,
          acronym: vm.item.acronym != item.acronym ? vm.item.acronym : undefined,
          personnel_file: vm.item.personnel_file != item.personnel_file ? vm.item.personnel_file : undefined,
          cuil: vm.item.cuil != item.cuil ? vm.item.cuil : undefined,
          fulltime: vm.item.fulltime != item.fulltime ? vm.item.fulltime : undefined,
          employee_hour_type_id: vm.item.employee_hour_type.id != item.employee_hour_type.id ? vm.item.employee_hour_type.id : undefined,
          employee_category_id: vm.item.employee_category.id != item.employee_category.id ? vm.item.employee_category.id : undefined,
          employee_area_id: vm.item.employee_area.id != item.employee_area.id ? vm.item.employee_area.id : undefined
        };
      }
      return params;
    }

    function update() {
      var tosave = getParametersForSave();
      UsersService.update(item.id, tosave)
        .then(function () {
          ToastService.show(MESSAGES.savedSuccessfuly);
          close();
        })
        .catch(function (response) {
          ToastService.showFormError(MESSAGES.somethingHapped + ' ' + MESSAGES.imposibleToSave, ['email', 'employee.personnel_file', 'employee.cuil', 'employee.acronym'], vm.form, response);
        });
    }

    function create() {
      var tosave = getParametersForSave();
      UsersService.create(tosave)
        .then(function () {
          ToastService.show(MESSAGES.savedSuccessfuly);
          close();
        })
        .catch(function (response) {
          ToastService.showFormError(MESSAGES.somethingHapped + ' ' + MESSAGES.imposibleToSave, ['email', 'employee.personnel_file', 'employee.cuil', 'employee.acronym'], vm.form, response);
        });
    }

    function close() {
      callback();
      $mdDialog.hide();
    }

    function fetchEmployeePositions() {
      EmployeePositionsService.index()
        .then(function (response) {
          vm.employeePositions = response.data.plain().employee_positions;
          if (!vm.new) {
            getEmployeeCategories();
          }

          _.remove(vm.employeePositions, function (o) {
            return !o.active && o.id != vm.item.employee_position.id || !o.active;
          });
        })
        .catch(function () {
          ToastService.showError(MESSAGES.imposibleToFetch + 'puestos');
        });
    }

    function getEmployeeCategories() {
      if (vm.item.employee_category && vm.item.employee_category.employee_position
        && vm.item.employee_category.employee_position.id) {
        var employeePosition = _.find(vm.employeePositions, function (o) {
          return o.id == vm.item.employee_category.employee_position.id;
        });

        vm.employeeCategories = employeePosition ? employeePosition.employee_categories : [];

        _.remove(vm.employeeCategories, function (o) {
          var isSameCategory = vm.item.employee_category && o.id == vm.item.employee_category.id;
          return !employeePosition.active && !isSameCategory || !o.active && !isSameCategory;
        });
      }
      else {
        vm.employeeCategories = [];
      }
    }

    function fetchEmployeeAreas() {
      EmployeeAreasService.index({'filter[where][active]': 1})
        .then(function (response) {
          vm.employeeAreas = response.data.plain().employee_areas;

          if (!vm.new && !vm.item.employee_area.active) {
            // if the current item is not active, it must be added to the collection
            // because it has to be selected anyway.
            vm.employeeAreas.push(angular.copy(vm.item.employee_area));
          }
        })
        .catch(function (response) {
          ToastService.showError(MESSAGES.imposibleToFetch + 'areas');
        });
    }

    function fetchEmployeeHourTypes() {
      EmployeeHourTypesService.index({'filter[where][active]': 1})
        .then(function (response) {
          vm.employeeHourTypes = response.data.plain().employee_hour_types;

          if (!vm.new && !vm.item.employee_hour_type.active) {
            // if the current item is not active, it must be added to the collection
            // because it has to be selected anyway.
            vm.employeeHourTypes.push(angular.copy(vm.item.employee_hour_type));
          }
        })
        .catch(function (response) {
          ToastService.showError(MESSAGES.imposibleToFetch + 'tipos de horas');
        });
    }

    function resetForm() {
      ToastService.resetForm(vm.form['email']);
      ToastService.resetForm(vm.form['employee.personnel_file']);
      ToastService.resetForm(vm.form['employee.acronym']);
      ToastService.resetForm(vm.form['employee.cuil']);
    }

    ///////////// UI FUNCTIONS

    function cancel() {
      $mdDialog.cancel();
    }

    function remove() {
      var confirm = $mdDialog.confirm()
        .title(MESSAGES.areYouSureToRemove)
        .targetEvent(event).ok(MESSAGES.yes).cancel(MESSAGES.no);

      $mdDialog.show(confirm).then(function () {
        UsersService.destroy(vm.item.user.id)
          .then(function () {
            ToastService.show(MESSAGES.removedSuccessfuly);
            callback_after_remove();
          })
          .catch(function (response) {
            ToastService.showError(MESSAGES.somethingHapped + " " + MESSAGES.imposibleToRemove);
          });
      });
    }
  }
})();
