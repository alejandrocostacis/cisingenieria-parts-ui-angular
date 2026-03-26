(function() {
  'use strict';

  angular
    .module('app.api', ['restangular'])
    .config(config)
    .run(run);

  /** @ngInject */
  function config() {

  }

  /** @ngInject */
  function run(Restangular, ENVIRONMENT) {
    Restangular.setBaseUrl(ENVIRONMENT.apiUrl);
    Restangular.setDefaultHeaders({'Content-Type': 'application/json'});
    Restangular.setFullResponse(true);
  }

})();
