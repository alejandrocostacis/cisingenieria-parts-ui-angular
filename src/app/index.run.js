(function () {
  'use strict';

  angular
    .module('uiPartsApp')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, $timeout, $state) {

    $rootScope.toast = {};

    // Activate loading indicator
    var stateChangeStartEvent = $rootScope.$on('$stateChangeStart', function () {
      $rootScope.loadingProgress = true;
    });

    // De-activate loading indicator
    var stateChangeSuccessEvent = $rootScope.$on('$stateChangeSuccess', function () {
      $timeout(function () {
        $rootScope.loadingProgress = false;
      });
    });

    // Store state in the root scope for easy access
    $rootScope.state = $state;

    // Cleanup
    $rootScope.$on('$destroy', function () {
      stateChangeStartEvent();
      stateChangeSuccessEvent();
    });

    // Authentication event handlers
    $rootScope.$on('auth:password-reset-confirm-success', function () {
      // TODO: resetPassword state
      // $state.go('app.resetPassword');
    });

    $rootScope.$on('auth:session-expired', function () {
      // Alert.error('Su sesión ha expirado. Por favor, vuelva a iniciarla.');
      $state.go('app.login')
    });
  }
})();
