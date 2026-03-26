(function ()
{
  'use strict';

  angular.module('app.settings').controller('EmployeeAreaDialogController', EmployeeAreaDialogController);

  function EmployeeAreaDialogController(MESSAGES, EmployeeAreasService, ToastService, $mdDialog, item, callback, $log)
  {
    var vm = this;
    vm.cancel = cancel;
    vm.remove = remove;
    vm.resetForm = resetForm;

    init();

    ////////// CONTROLLER FUNCTIONS
    function init() {
      vm.item = angular.copy(item);
      vm.new = false;
      vm.save = update;

      if(!vm.item){
        vm.item = {
          active: true
        };
        vm.new = true;
        vm.save = create;
      }
    }

    function getParametersForSave() {
      var params = {};

      if (vm.new){
        params.name = vm.item.name;
        params.active = vm.item.active;
      } else {
        params.name = vm.item.name != item.name? vm.item.name : undefined;
        params.active = vm.item.active != item.active? vm.item.active : undefined;
      }

      return params;
    }

    function update() {
      var tosave = getParametersForSave();
      EmployeeAreasService.update(item.id, tosave).then(function () {
        ToastService.show(MESSAGES.savedSuccessfuly);
        close();
      }).catch(function (response) {
        ToastService.showFormError(MESSAGES.somethingHapped + ' ' + MESSAGES.imposibleToSave, ['name'], vm.form, response);
      });
    }

    function create() {
      var tosave = getParametersForSave();
      EmployeeAreasService.create(tosave).then(function () {
        ToastService.show(MESSAGES.savedSuccessfuly);
        close();
      }).catch(function (response) {
        ToastService.showFormError(MESSAGES.somethingHapped + ' ' + MESSAGES.imposibleToSave, ['name'], vm.form, response);
      });
    }

    function close() {
      callback();
      $mdDialog.hide();
    }

    function resetForm() {
      ToastService.resetForm(vm.form.name);
    }

    ///////// UI FUNCTIONS
    function remove() {
      var confirm = $mdDialog.confirm()
        .title(MESSAGES.areYouSureToRemove)
        .targetEvent(event).ok(MESSAGES.yes).cancel(MESSAGES.no);

      $mdDialog.show(confirm).then(function () {
        EmployeeAreasService.destroy(item.id).then(function () {
          ToastService.show(MESSAGES.removedSuccessfuly);
          callback();
        }).catch(function (response) {
          ToastService.showError(MESSAGES.somethingHapped + ' ' + MESSAGES.imposibleToRemove);
        });
      });
    }

    function cancel() {
      $mdDialog.cancel();
    }

  }
})();
