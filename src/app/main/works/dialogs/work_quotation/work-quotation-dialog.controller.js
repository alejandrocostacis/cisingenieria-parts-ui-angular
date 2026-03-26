(function () {
  'use strict';

  angular.module('app.works').controller('WorkQuotationDialogController', WorkQuotationDialogController);

  function WorkQuotationDialogController(MESSAGES, ToastService, WorkQuotationsService, EmployeeAreasService, work_id, item, callback, quotesSummary, $mdDialog, $scope, $log) {
    var vm = this;

    vm.cancel = cancel;
    vm.remove = remove;
    vm.addWorkQuotationSpeciality = addWorkQuotationSpeciality;
    vm.removeWorkQuotationSpeciality = removeWorkQuotationSpeciality;

    init();

    ///////// CONTROLLER FUNCTIONS
    function init() {
      fetchEmployeeAreas();

      vm.item = angular.copy(item);
      vm.new = false;
      vm.save = update;
      vm.minHours = 0;

      if (!vm.item) {
        vm.item = {
          work_id: work_id,
          work_quotation_specialities_attributes: []
        };
        vm.new = true;
        vm.save = create;
      }

      vm.inputWorkQuotationSpeciality = {
        employee_area: null,
        speciality: null,
        speciality_id: 0,
        hours: 0
      };

      vm.selectedWorkQuotationSpecialites = [];

      $scope.$watch('vm.inputWorkQuotationSpeciality.speciality', function (newValue, oldValue, scope) {
        var area = _.find(quotesSummary.employee_areas, function (area) {
          return area.name == vm.inputWorkQuotationSpeciality.employee_area.name;
        });

        if (area != null) {
          var speciality = _.find(area.specialities, function (speciality) {
            return speciality.name == vm.inputWorkQuotationSpeciality.speciality.name;
          });

          if (speciality != null) {
            vm.minHours = -1 * speciality.value;
          } else {
            vm.minHours = 0;
          }
        } else {
          vm.minHours = 0;
        }
      });
    }

    function fetchEmployeeAreas() {
      EmployeeAreasService.index({'filter[where][active]': 1}).then(function (response) {
        vm.employeeAreas = response.data.plain().employee_areas;

        _.forEach(vm.employeeAreas, function (o) {
          _.remove(o.specialities, function (o2) {
            return !o2.active;
          });
        });

      }).catch(function (response) {
        ToastService.showError(MESSAGES.imposibleToFetch + 'areas');
      });
    }

    function getParametersForSave() {
      var params = {};

      if (vm.new) {
        params.work_id = work_id;
        params.observations = vm.item.observations;
        params.work_quotation_specialities_attributes = [];
        _.forEach(vm.selectedWorkQuotationSpecialites, function (o) {
          params.work_quotation_specialities_attributes.push({
            speciality_id: o.speciality.id,
            hours: o.hours
          });
        });
      } else {
        params.observations = vm.item.observations != item.observations ? vm.item.observations : undefined;
      }

      return params;
    }

    function update() {
      var tosave = getParametersForSave();
      WorkQuotationsService.update(item.id, tosave).then(function () {
        ToastService.show(MESSAGES.savedSuccessfuly);
        close();
      }).catch(function (response) {
        ToastService.showError(MESSAGES.somethingHapped + " " + MESSAGES.imposibleToSave);
      });
    }

    function create() {
      var tosave = getParametersForSave();
      WorkQuotationsService.create(tosave).then(function () {
        ToastService.show(MESSAGES.savedSuccessfuly);
        close();
      }).catch(function (response) {
        ToastService.showError(MESSAGES.somethingHapped + " " + MESSAGES.imposibleToSave);
      });
    }

    function close() {
      callback();
      $mdDialog.hide();
    }

    ///////////// UI FUNCTIONS

    function addWorkQuotationSpeciality() {
      vm.selectedWorkQuotationSpecialites.push({
        employee_area: vm.inputWorkQuotationSpeciality.employee_area,
        speciality: vm.inputWorkQuotationSpeciality.speciality,
        hours: vm.inputWorkQuotationSpeciality.hours
      });

      _.remove(vm.inputWorkQuotationSpeciality.employee_area.specialities, function (o) {
        return o.id === vm.inputWorkQuotationSpeciality.speciality.id;
      });

      if (vm.inputWorkQuotationSpeciality.employee_area.specialities.length == 0) {
        _.remove(vm.employeeAreas, function (o) {
          return o.id === vm.inputWorkQuotationSpeciality.employee_area.id;
        });
      }

      vm.inputWorkQuotationSpeciality.hours = 0;
    }

    function removeWorkQuotationSpeciality(workQuotationSpeciality) {
      if (!_.find(vm.employeeAreas, function (o) {
          return o.id === workQuotationSpeciality.employee_area.id;
        })) {
        vm.employeeAreas.push(workQuotationSpeciality.employee_area);
      }
      workQuotationSpeciality.employee_area.specialities.push(workQuotationSpeciality.speciality);

      _.remove(vm.selectedWorkQuotationSpecialites, function (o) {
        return o.speciality.id === workQuotationSpeciality.speciality.id;
      });

      vm.inputWorkQuotationSpeciality.hours = 0;
    }

    function cancel() {
      $mdDialog.cancel();
    }

    function remove() {
      var confirm = $mdDialog.confirm()
        .title(MESSAGES.areYouSureToRemove)
        .targetEvent(event).ok(MESSAGES.yes).cancel(MESSAGES.no);

      $mdDialog.show(confirm).then(function () {
        WorkQuotationsService.destroy(vm.item.id).then(function () {
          ToastService.show(MESSAGES.removedSuccessfuly);
          callback();
        }).catch(function (response) {
          ToastService.showError(MESSAGES.somethingHapped + " " + MESSAGES.imposibleToRemove);
        });
      });
    }
  }
})();
