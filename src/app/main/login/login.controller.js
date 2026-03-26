(function () {
  'use strict';
  angular.module('app.login').controller('LoginController', LoginController);

  /** @ngInject */
  function LoginController(MESSAGES, ToastService, $log, $rootScope, UsersService, msNavigationService, $state, $auth, STORAGE_KEYS, localStorageService, $mdDialog, $document) {
    var vm = this;
    vm.login = login;

    // METHODS FOR UI
    function onLoginSuccess(userData) {
      UsersService.show(userData.id).then(function (response) {
        $rootScope.currentUser = response.data.plain()[parseCamelCaseToUnderScore(userData.role)];

        localStorageService.set(STORAGE_KEYS.uid, JSON.stringify(vm.form.email));
        if (!userData.first_sign_in) {
          openFirstSignInDialog();
        } else {
          _updateNavigationItems($rootScope.currentUser.role);
          $state.go('app.home.home');
        }
      }).catch(function (response) {
        ToastService.showError(MESSAGES.imposibleToFetchOne + 'usuario');
        $state.go('app.login');
      });
    }

    function openFirstSignInDialog() {
      $mdDialog.show({
        controller: 'FirstSignInDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/login/first_sign_in_dialog/first-sign-in-dialog.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: event,
        locals: {
          user_id: $rootScope.currentUser.id,
          callback: function () {
            if (!$rootScope.currentUser.first_sign_in) {
              $state.go('app.login');
            } else {
              _updateNavigationItems($rootScope.currentUser.role);
              $state.go('app.home.home');
            }
          }
        }
      })
    }

    function onLoginError(result) {
      ToastService.showError(MESSAGES.loginFailed);
    }

    function login() {
      $auth.submitLogin(vm.form)
        .then(onLoginSuccess)
        .catch(onLoginError);
    }

    function _updateNavigationItems(userRole) {
      switch(userRole) {
        case "UserEmployee":
          msNavigationService.deleteItem('settings');
          msNavigationService.deleteItem('works');
          msNavigationService.deleteItem('reports');
          msNavigationService.deleteItem('employees');
          msNavigationService.deleteItem('customers');
          break;
        case "UserProjectLeader":
          msNavigationService.deleteItem('settings');
          msNavigationService.deleteItem('reports');
          msNavigationService.deleteItem('employees');
          msNavigationService.deleteItem('customers');
          break;
        case "UserAuxiliaryCoordinator":
          msNavigationService.deleteItem('settings');
          msNavigationService.deleteItem('reports');
          msNavigationService.deleteItem('employees');
          msNavigationService.deleteItem('customers');
          break;
        case "UserAdministrativeAssistant":
          msNavigationService.deleteItem('settings');
          msNavigationService.deleteItem('works');
          msNavigationService.deleteItem('reports');
          msNavigationService.deleteItem('customers');
          msNavigationService.deleteItem('employees.costs');
          break;
        case "UserHumanResourceManager":
          msNavigationService.deleteItem('settings');
          msNavigationService.deleteItem('works');
          break;
        case "UserManager":
          break;
        case "UserSuperAdmin":
          break;
        case "UserAdmin":
          break;
        case "UserAreaChief":
          break;
        case "UserCoordinator":
          break;
      }
    }

    function parseCamelCaseToUnderScore(s) {
      return s.replace(/(?:^|\.?)([A-Z])/g, function (x,y){return "_" + y.toLowerCase()}).replace(/^_/, "");
    }

  }
})();
