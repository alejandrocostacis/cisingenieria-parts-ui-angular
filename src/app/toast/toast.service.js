(function () {
  'use strict';
  angular.module('app.toast').service('ToastService', ToastService);

  /** @ngInject */
  function ToastService($rootScope, $mdToast) {
    this.show = show;
    this.showError = showError;
    this.showFormError = showFormError;
    this.resetForm = resetForm;

    var config = {
        hideDelay   : 3000,
        position    : 'top right',
        controller  : 'ToastController',
        templateUrl : 'app/toast/toast.html'
    };

    function show(content) {
      $rootScope.toast.content = content;
      $rootScope.toast.icon = 'icon-information-outline';
      $rootScope.toast.icon_type = 'info';

      $mdToast.show(config);
    }

    function showError(content) {
      config.hideDelay = 10000;
      $rootScope.toast.content = content;
      $rootScope.toast.icon = 'icon-alert-octagon';
      $rootScope.toast.icon_type = 'error';

      $mdToast.show(config);
      config.hideDelay = 3000;
    }

    function showFormError(content, fieldNames, form, response) {
      $rootScope.toast.content = content;
      $rootScope.toast.icon = 'icon-alert-octagon';
      $rootScope.toast.icon_type = 'error';

      if (response.status != -1) {
        _parseError(fieldNames, form, response);
      } else {
        $rootScope.toast.content = 'Oops! Algo ha ocurrido con el servicio. Intente más tarde o pongase en contacto con un administrador';
      }

      $mdToast.show(config);
    }

    function resetForm(attr) {
      if (attr.$invalid) {
        attr.$$parentForm.$setValidity(true);
        attr.$$parentForm.$setPristine(true);
      }
    }

    function _parseError(fieldNames, form, response) {
      _.forEach(fieldNames, function (field) {
        if (response.data.errors[field]) {
          form[field].$setValidity(field, false);
          form[field].$error[field] = response.data.errors[field][0];
        }
      });
    }
  }

})();
