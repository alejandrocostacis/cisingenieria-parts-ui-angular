(function () {
  'use strict';

  angular.module('app.customers').controller('CustomersController', CustomersController);

  /** @ngInject */
  function CustomersController(MESSAGES, CustomersService, $scope, $rootScope, $state, $mdMedia, $mdDialog, $document, $log) {
    var vm = this;
    var views = {};
    var default_filters = {
      'sort[by]': 'id',
      'sort[order]': 'DESC',
      'includes': '{id:true, name:true, active:true}'
    };

    vm.openItem = openItem;
    vm.closeItem = closeItem;
    vm.openItemDialog = openItemDialog;
    vm.openEconomicUnitDialog = openEconomicUnitDialog;
    vm.changeView = changeView;
    vm.fetchItems = fetchItems;
    vm.searchClick = searchClick;

    init();

    // ####################################  UI FUNCTIONS
    function searchClick() {
      closeItem();
      vm.filters = angular.copy(default_filters);

      if(vm.filterForm.id > 0){
        vm.filters['filter[where][id]'] = vm.filterForm.id;
        vm.filterForm.active = -1;
        vm.filterForm.name = '';
      } else {
        if (vm.filterForm.per_page > 0) {
          vm.filters['pagination[page]'] = 1;
          vm.filters['pagination[per_page]'] = vm.filterForm.per_page;
        }

        if (vm.filterForm.active > -1) {
          vm.filters['filter[where][active]'] = vm.filterForm.active;
        }

        if (vm.filterForm.name !== '') {
          vm.filters['filter[where][name]'] = vm.filterForm.name;
        }
      }

      fetchItems();
    }

    function openItemDialog(event, item) {
      if (event) {
        event.stopPropagation();
      }

      $mdDialog.show({
        controller: 'CustomerDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/customers/dialogs/customer/customer-dialog.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: event,
        locals: {
          item: item,
          callback: item != null ?  reOpenCurrentItem : fetchItems,
          callback_after_remove: function() {
            _.remove(vm.items, function (item) {
              return item.id == vm.currentItem.id;
            });
            closeItem();
          }
        }
      })
    }

    function openEconomicUnitDialog(event, item) {
      if (event) {
        event.stopPropagation();
      }

      $mdDialog.show({
        controller: 'EconomicUnitDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/customers/dialogs/economic_unit/economic-unit-dialog.html',
        parent: angular.element($document.find('#content-container')),
        targetEvent: event,
        locals: {
          item: item,
          customer_id: vm.currentItem.id,
          callback: fetchEconomicUnits
        }
      })
    }

    function reOpenCurrentItem() {
      openItem(vm.currentItem.id);
    }

    /**
     * Open the selected item, and request for full information against the api.
     * @param id the item unique identifier
     */
    function openItem(id) {
      vm.ui.loadingCurrentItem = true;
      CustomersService.show(id).then(function (response) {
        vm.currentItem = response.data.plain().customer;

        vm.ui.loadingCurrentItem = false;

        // Update the state without reloading the controller
        $state.go('app.customers.customers.customer', {id: id}, {notify: false});
      }).catch(function (response) {
        $log.error(response);
      });
    }

    /**
     * Close current item.
     */
    function closeItem() {
      vm.currentItem = null;

      // Update the state without reloading the controller
      $state.go('app.customers.customers', {notify: false});
    }

    function changeView(viewName) {
      if (views[viewName]) {
        vm.defaultView = views[viewName];
        vm.currentView = views[viewName];
      }

      vm.currentView = views[viewName];
      vm.currentItem = null;
    }

    // ####################################  CONTROLLER FUNCTIONS

    function init() {
      vm.role = $rootScope.currentUser.role;
      vm.ui = {};
      initFilters();
      initViews();
      initListView();
      initScreenResizeWatchers();
    }

    function initFilters() {
      vm.filters = angular.copy(default_filters);
      vm.filters['pagination[page]'] = 1;
      vm.filters['pagination[per_page]'] = 25;

      vm.filterInputs = {};
      vm.filterForm = {
        per_page: 25,
        id: '',
        active: -1,
        name: ''
      };
    }

    function initViews() {
      views = {
        classic: {
          name: 'classic',
          url: 'app/main/customers/views/classic/classic-view.html'
        },
        outlook: {
          name: 'outlook',
          url: 'app/main/customers/views/outlook/outlook-view.html'
        }
      };
      vm.defaultView = views['classic'];
      changeView('classic');
    }

    /**
     * Initialize list view.
     */
    function initListView() {
      fetchItems();
    }

    /**
     * Initialize screen size watchers to change views depends on the screen size.
     */
    function initScreenResizeWatchers() {
      // Watch screen size to change view modes
      $scope.$watch(function () {
        return $mdMedia('xs');
      }, function (current, old) {
        if (angular.equals(current, old)) {
          return;
        }

        if (current) {
          vm.currentView = views.classic;
        }
      });

      $scope.$watch(function () {
        return $mdMedia('gt-xs');
      }, function (current, old) {
        if (angular.equals(current, old)) {
          return;
        }

        if (current) {
          if (vm.defaultView.name === 'outlook') {
            vm.currentView = views.outlook;
          }
        }
      });
    }

    /**
     * Request for items.
     */
    function fetchItems() {
      vm.ui.loadingItems = true;
      vm.currentItem = null;

      CustomersService.index(vm.filters).then(function (items) {
        vm.items = items.data.plain().customers;

        // Set items counts
        if (items.data.plain().meta && items.data.plain().meta.count) {
          vm.items_total_count = items.data.plain().meta.count;
        } else {
          vm.items_total_count = vm.items.length;
        }

        vm.ui.loadingItems = false;

        // Open the item if needed
        if ($state.params.id) {
          vm.openItem($state.params.id);
        }
      }).catch(function (response) {
        $log.error(response);
      });
    }

    function fetchEconomicUnits() {
      vm.ui.loadingEconomicUnits = true;
      CustomersService.economicUnits(vm.currentItem.id).then(function (response) {
        vm.currentItem.economic_units = response.data.plain().economic_units;
        vm.ui.loadingEconomicUnits = false;
      }).catch(function (response) {
        $log.error(response);
      });
    }
  }
})();
