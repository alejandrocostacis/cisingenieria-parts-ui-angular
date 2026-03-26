(function () {
  'use strict';

  angular.module('app.login').controller('FirstSignInDialogController', FirstSignInDialogController);

  function FirstSignInDialogController(MESSAGES, ToastService, UsersService, $scope, $rootScope, user_id, $mdDialog, callback, $log) {
    var vm = this;
    vm.save = save;
    vm.cancel = cancel;

    init();

    ///////// CONTROLLER FUNCTIONS
    function init() {

    }

    function save() {
      UsersService.updateOnFirstSignIn(user_id, {password: vm.password}).then(function () {
        $rootScope.currentUser.first_sign_in = true;
        ToastService.show(MESSAGES.passwordChangedSuccessfuly);
        close();
      }).catch(function (response) {
        ToastService.showError(MESSAGES.imposibleToChangePassword);
      });
    }

    function close() {
      callback();
      $mdDialog.hide();
    }

    ///////////// UI FUNCTIONS

    function cancel() {
      $mdDialog.cancel();
    }

  }
})();
