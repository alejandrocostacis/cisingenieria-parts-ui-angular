(function () {
  'use strict';
  angular.module('app.api').service('UsersService', UsersService);

  /** @ngInject */
  function UsersService($rootScope, Restangular, $q, $log) {
    this.index = index;
    this.show = show;
    this.create = create;
    this.update = update;
    this.destroy = destroy;
    this.signOut = signOut;

    this.resetPassword = resetPassword;
    this.updateOnFirstSignIn = updateOnFirstSignIn;

    var RESOURCE = 'users';

    function show(id, params) {
      return Restangular.one(RESOURCE, id).get(params);
    }

    function index(params) {
      return Restangular.one(RESOURCE).get(params);
    }

    function create(object) {
      return Restangular.all(RESOURCE).customPOST(object);
    }

    function update(id, object) {
      return Restangular.one(RESOURCE, id).customPUT(object);
    }

    function signOut() {
      return Restangular.one('auth').one('sign_out').customDELETE();
    }

    function destroy(id) {
      return Restangular.one(RESOURCE, id).customDELETE();
    }

    function resetPassword(id) {
      return Restangular.one(RESOURCE, id).one('reset_password').customPUT();
    }

    function updateOnFirstSignIn(id, object) {
      return Restangular.one(RESOURCE, id).one('update_on_first_sign_in').customPUT(object);
    }
  }

})();
