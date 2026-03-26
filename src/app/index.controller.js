(function () {
  'use strict';

  angular
    .module('uiPartsApp')
    .controller('IndexController', IndexController);

  /** @ngInject */
  function IndexController(fuseTheming) {
    var vm = this;

    // Data
    vm.themes = fuseTheming.themes;
  }
})();
