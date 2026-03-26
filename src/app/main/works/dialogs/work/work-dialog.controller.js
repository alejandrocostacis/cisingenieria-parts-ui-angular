(function () {
  'use strict';
  angular.module('app.works').controller('WorkDialogController', WorkDialogController);
  function WorkDialogController(
    MESSAGES,
    ToastService,
    WorksService,
    EmployeesService,
    CustomersService,
    WorkTypesService,
    WorkGroupsService,
    WorkStatesService,
    BudgetsService,
    $mdDialog,
    $element,
    item,
    callback,
    callback_after_remove
  ) {
    var vm = this;
    vm.cancel = cancel;
    vm.remove = remove;
    vm.filterEmployees = filterEmployees;
    vm.filterCustomers = filterCustomers;
    vm.filterEconomicUnits = filterEconomicUnits;
    vm.onSelectedCustomerChanged = onSelectedCustomerChanged;
    vm.resetForm = resetForm;

    vm.searchEmployeeTerm = '';
    vm.clearSearchTerm = function () {
      vm.searchEmployeeTerm = '';
    };
    // The md-select directive eats keydown events for some quick select
    // logic. Since we have a search input here, we don't need that logic.
    $element.find('.input-employee').on('keydown', function (ev) {
      ev.stopPropagation();
    });

    init();

    ///////// CONTROLLER FUNCTIONS
    function init() {
      fetchEmployees();
      fetchCustomers();
      fetchWorkGroups();
      fetchWorkStates();
      fetchWorkTypes();

      vm.item = angular.copy(item);
      vm.new = false;
      vm.save = update;
      vm.todayDate = new Date();
      vm.inputForm = {};

      if (!vm.item) {
        vm.item = {
          awarded_at: vm.todayDate,
          active: true
        };
        vm.new = true;
        vm.save = create;
      }
      else {
        getBudgets(vm.item.customer.id)
        vm.item.awarded_at = vm.item.awarded_at ? new Date(vm.item.awarded_at) : null;
      }

      initCustomerAutocomplete();
      initEconomicUnitAutocomplete();
    }

    function update() {
      var tosave = getParametersForSave();
      WorksService.update(item.id, { work: tosave })
        .then(function () {
          ToastService.show(MESSAGES.savedSuccessfuly);
          close();
        })
        .catch(function (response) {
          ToastService.showFormError(MESSAGES.somethingHapped + " " + MESSAGES.imposibleToSave, ['name'], vm.form, response);
        });
    }

    function create() {
      var tosave = getParametersForSave();
      WorksService.create({ work: tosave })
        .then(function () {
          ToastService.show(MESSAGES.savedSuccessfuly);
          close();
        })
        .catch(function (response) {
          ToastService.showFormError(MESSAGES.somethingHapped + " " + MESSAGES.imposibleToSave, ['name'], vm.form, response);
        });
    }

    function close() {
      callback();
      $mdDialog.hide();
    }

    function getParametersForSave() {
      var params = {};

      if (vm.new) {
        params.name = vm.item.name;
        params.active = vm.item.active;
        params.economic_unit_id = vm.inputForm.economicUnit.selected.id;
        params.employee_ids = [];
        vm.item.employees.forEach(function (employee) {
          params.employee_ids.push(employee.id);
        })
        params.work_type_id = vm.item.work_type.id;
        params.work_group_id = vm.item.work_group.id;
        params.work_state_id = vm.item.work_state.id;
        params.awarded_at = vm.item.awarded_at;
        params.notes = vm.item.notes;
        params.sell_value = vm.item.sell_value;
        params.estimated_cost = vm.item.estimated_cost;
      }
      else {
        params.name = vm.item.name != item.name ? vm.item.name : undefined;
        params.active = vm.item.active != item.active ? vm.item.active : undefined;
        params.economic_unit_id = vm.inputForm.economicUnit.selected.id != item.economic_unit.id ? vm.inputForm.economicUnit.selected.id : undefined;
        params.employee_ids = [];
        vm.item.employees.forEach(function (employee) {
          params.employee_ids.push(employee.id);
        })
        params.work_type_id = vm.item.work_type.id != item.work_type.id ? vm.item.work_type.id : undefined;
        params.work_group_id = vm.item.work_group.id != item.work_group.id ? vm.item.work_group.id : undefined;
        params.work_state_id = vm.item.work_state.id != item.work_state.id ? vm.item.work_state.id : undefined;
        params.awarded_at = vm.item.awarded_at != item.awarded_at ? vm.item.awarded_at : undefined;
        params.notes = vm.item.notes != item.notes ? vm.item.notes : undefined;
        params.sell_value = vm.item.sell_value != item.sell_value ? vm.item.sell_value : undefined;
        params.estimated_cost = vm.item.estimated_cost != item.estimated_cost ? vm.item.estimated_cost : undefined;
      }
      return params;
    }

    function fetchEmployees() {
      EmployeesService.index()
        .then(function (response) {
          vm.employees = response.data.plain().employees;

          if (!vm.new) {
            vm.item.employees.forEach(function (employee) {
              vm.employees.push(angular.copy(employee));
            })
          }

          _.remove(vm.employees, function (o) {
            return !o.user.active;
          });
        })
        .catch(function () {
          ToastService.showError(MESSAGES.imposibleToFetch + 'empleados');
        });
    }

    function fetchWorkTypes() {
      WorkTypesService.index({ 'filter[where][active]': 1 })
        .then(function (response) {
          vm.workTypes = response.data.plain().work_types;

          if (!vm.new && !vm.item.work_type.active) {
            // if the current work type is not active, it must be added to the collection
            // because it has to be selected anyway.
            vm.workTypes.push(angular.copy(vm.item.work_type));
          }
        })
        .catch(function () {
          ToastService.showError(MESSAGES.imposibleToFetch + 'tipos de obras');
        });
    }

    function fetchWorkGroups() {
      WorkGroupsService.index({ 'filter[where][active]': 1 })
        .then(function (response) {
          vm.workGroups = response.data.plain().work_groups;

          if (!vm.new && !vm.item.work_group.active) {
            // if the current work type is not active, it must be added to the collection
            // because it has to be selected anyway.
            vm.workGroups.push(angular.copy(vm.item.work_group));
          }
        })
        .catch(function () {
          ToastService.showError(MESSAGES.imposibleToFetch + 'grupos de obras');
        });
    }

    function fetchWorkStates() {
      WorkStatesService.index({ 'filter[where][active]': 1 })
        .then(function (response) {
          vm.workStates = response.data.plain().work_states;

          if (!vm.new && !vm.item.work_state.active) {
            // if the current work type is not active, it must be added to the collection
            // because it has to be selected anyway.
            vm.workStates.push(angular.copy(vm.item.work_state));
          }
        })
        .catch(function () {
          ToastService.showError(MESSAGES.imposibleToFetch + 'estados');
        });
    }

    function fetchCustomers() {
      CustomersService.index({ 'filter[where][active]': 1 })
        .then(function (response) {
          vm.customers = response.data.plain().customers;

          if (!vm.new && !vm.item.customer.active) {
            // if the current work customer is not active, it must be added to the collection
            // because it has to be selected anyway.
            vm.customers.push(angular.copy(vm.item.customer));
          }
        })
        .catch(function () {
          ToastService.showError(MESSAGES.imposibleToFetch + 'clientes');
        });
    }

    function getBudgets(customerId) {
      BudgetsService.index(customerId)
        .then(function (response) {
          vm.budgetPerWorks = response.data.plain().budget_per_works;
        })
        .catch(function () {
          ToastService.showFormError(MESSAGES.imposibleToFetch + 'presupuestos');
        });
    }

    function fetchEconomicUnits(customerId) {
      CustomersService.economicUnits(customerId, { 'filter[where][active]': 1 })
        .then(function (response) {
          vm.inputForm.customer.selected.economic_units = response.data.plain().economic_units;

          if (!vm.new && !vm.item.economic_unit.active) {
            // if the current work economic unit is not active, it must be added to the collection
            // because it has to be selected anyway.
            vm.inputForm.customer.selected.economic_units.push(angular.copy(vm.item.economic_unit));
          }

        })
        .catch(function () {
          ToastService.showError(MESSAGES.imposibleToFetch + 'unidades economicas');
        });
    }

    function initCustomerAutocomplete() {
      vm.inputForm.customer = {};
      if (vm.new) {
        vm.inputForm.customer.searchText = '';
        vm.inputForm.customer.selected = null;
      }
      else {
        vm.inputForm.customer.searchText = vm.item.customer.name;
        vm.inputForm.customer.selected = vm.item.customer;
        fetchEconomicUnits(vm.item.customer.id);
      }
    }

    function initEconomicUnitAutocomplete() {
      vm.inputForm.economicUnit = {};
      if (vm.new) {
        vm.inputForm.economicUnit.searchText = '';
        vm.inputForm.economicUnit.selected = null;
      }
      else {
        vm.inputForm.economicUnit.searchText = vm.item.economic_unit.name;
        vm.inputForm.economicUnit.selected = vm.item.economic_unit;
      }
    }

    function resetForm() {
      ToastService.resetForm(vm.form.name);
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
        WorksService.destroy(vm.item.id)
          .then(function () {
            ToastService.show(MESSAGES.removedSuccessfuly);
            callback_after_remove();
          })
          .catch(function () {
            ToastService.showError(MESSAGES.somethingHapped + " " + MESSAGES.imposibleToRemove);
          });
      });
    }

    function onSelectedCustomerChanged(customer) {
      if (customer == null) {
        vm.inputForm.economicUnit.selected = null;
        vm.inputForm.economicUnit.searchText = '';
      }
      else {
        getBudgets(customer.id);
        fetchEconomicUnits(customer.id);
      }
    }

    function filterEmployees(query) {
      if (query != '') {
        var items = [];
        _.forEach(vm.employees, function (item) {
          var queryLowerCase = angular.lowercase(query);
          var filterCondition = angular.lowercase(item.name).startsWith(queryLowerCase) ||
            angular.lowercase(item.lastname).startsWith(queryLowerCase) ||
            (item.cuil != null ? angular.lowercase(item.cuil).startsWith(queryLowerCase) : false) ||
            (item.personnel_file != null ? angular.lowercase(item.personnel_file).startsWith(queryLowerCase) : false) ||
            (item.acronym != null ? angular.lowercase(item.acronym).startsWith(queryLowerCase) : false);

          if (filterCondition) {
            items.push(item);
          }
        });

        return items;
      }
      else {
        return vm.employees;
      }
    }

    function filterCustomers(query) {
      if (query != '') {
        var items = [];
        _.forEach(vm.customers, function (item) {
          if (angular.lowercase(item.name).startsWith(angular.lowercase(query))) {
            items.push(item);
          }
        });

        return items;
      }
      else {
        return vm.customers;
      }
    }

    function filterEconomicUnits(query) {
      if (!vm.inputForm.customer.selected) {
        return [];
      }

      if (query != '') {
        var items = [];
        _.forEach(vm.inputForm.customer.selected.economic_units, function (item) {
          if (angular.lowercase(item.name).startsWith(angular.lowercase(query))) {
            items.push(item);
          }
        });

        return items;
      }
      else {
        return vm.inputForm.customer.selected.economic_units;
      }
    }
  }
})();
