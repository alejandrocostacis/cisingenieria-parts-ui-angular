(function () {
  'use strict';

  angular.module('app.toast').controller('ToastController', ToastController);

  /** @ngInject */
  function ToastController($scope, $rootScope, $mdToast, $mdDialog) {
    $scope.closeToast = closeToast;

    $scope.content = $rootScope.toast.content;
    $scope.icon = $rootScope.toast.icon;
    $scope.icon_type = $rootScope.toast.icon_type;

    var isDlgOpen;

    function closeToast() {
      if (isDlgOpen) return;
      $mdToast
        .hide()
        .then(function() {
          isDlgOpen = false;
        });
    }
  }
})();
