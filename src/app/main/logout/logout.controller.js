(function () {
  'use strict';
  angular.module('app.logout').controller('LogoutController', LogoutController);

  /** @ngInject */
  function LogoutController(MESSAGES, $log, $rootScope, UsersService, $state, $auth, STORAGE_KEYS, localStorageService, $mdDialog, $document) {
    var vm = this;

    init();

    function init() {
        UsersService.signOut().then(function(){
          $rootScope.currentUser = null;
          $state.go('app.login')
        }).catch(function(){
          $rootScope.currentUser = null;
          $state.go('app.login')
        });
    }

  }
})();
