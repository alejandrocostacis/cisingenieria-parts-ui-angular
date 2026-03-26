(function () {
  'use strict';

  angular.module('app.hour_assignments').controller('HourAssignmentDialogController', HourAssignmentDialogController);

  function HourAssignmentDialogController(MESSAGES, ToastService, $mdDialog, $scope, $rootScope, hourAssignment, item, callback, $log, HourAssignmentsService, WorksService, PlacesService, ActivitiesService, EmployeeAreasService) {
    var vm = this;
    vm.cancel = cancel;
    vm.remove = remove;
    vm.filterWorks = filterWorks;
    vm.getWorkDisplayName = getWorkDisplayName;
    vm.areHoursAndMinutesValid = areHoursAndMinutesValid;

    init();

    ///////// CONTROLLER FUNCTIONS
    function init() {
      vm.ui = {
        loading: true
      };
      vm.clock = {
        options: {
          done: 'Ok !!',
          twelvehour: false,
          nativeOnMobile: true,
          autoclose: true
        },
        value: moment('2013-09-29 18:42')
      };

      Promise.all([
        fetchEmployeeAreas(),
        fetchPlaces(),
        fetchWorks()
      ])
        .then(function() {
          vm.ui.loading = false;
        });

      vm.item = angular.copy(item);
      vm.new = false;
      vm.save = update;
      vm.inputForm = {};

      if (!vm.item) {
        vm.item = {};
        vm.new = true;
        vm.save = create;
      }

      if (vm.new) {
        vm.clock.value = vm.clock.value.hour(hourAssignment.minutes_to_assign_parsed.hours);
        vm.clock.value = vm.clock.value.minute(hourAssignment.minutes_to_assign_parsed.minutes);
      } else {
        var minutes_parsed = parseMinutes(item.minutes);
        vm.clock.value = vm.clock.value.hour(minutes_parsed.hours);
        vm.clock.value = vm.clock.value.minute(minutes_parsed.minutes);
      }

      $scope.$watch('vm.item.speciality.employee_area.id', function () {
        getSpecialities();
      });

      $scope.$watch('vm.inputForm.work.selected.id', function () {
        if (vm.inputForm.work.selected && vm.inputForm.work.selected.id == 2) {
          fetchActivities(0);
        } else {
          fetchActivities(1);
        }
      });

      initWorkAutocomplete();
    }

    function fetchWorks() {
      vm.worksLoading = true;
      return WorksService.index({
        'filter[where][active]': 1,
        'filter[where][work_state_id]': 2,
        'includes': '{id:true, name:true, active:true}'
      })
        .then(function (response) {
          vm.works = response.data.plain().works;
          if (!vm.new) {
            vm.works.push(angular.copy(vm.item.work));
          }
          vm.worksLoading = false;
        }).catch(function (response) {
          ToastService.showError(MESSAGES.imposibleToFetch + 'obras');
        });
    }

    function fetchPlaces() {
      return PlacesService.index({ 'filter[where][active]': 1 }).then(function (response) {
        vm.places = response.data.plain().places;

        if (!vm.new && !vm.item.place.active) {
          // if the current item is not active, it must be added to the collection
          // because it has to be selected anyway.
          vm.places.push(angular.copy(vm.item.place));
        }
      }).catch(function (response) {
        ToastService.showError(MESSAGES.imposibleToFetch + 'lugares');
      });
    }

    function fetchActivities(working) {
      return ActivitiesService.index({ 'filter[where][active]': 1, 'filter[where][working]': working }).then(function (response) {
        vm.activities = response.data.plain().activities;

        if (!vm.new && !vm.item.activity.active) {
          // if the current item is not active, it must be added to the collection
          // because it has to be selected anyway.
          vm.activities.push(angular.copy(vm.item.activity));
        }
      }).catch(function (response) {
        ToastService.showError(MESSAGES.imposibleToFetch + 'actividades');
      });
    }

    function fetchEmployeeAreas() {
      return EmployeeAreasService.index().then(function (response) {
        vm.employeeAreas = response.data.plain().employee_areas;
        if (!vm.new) {
          getSpecialities();
        }

        _.remove(vm.employeeAreas, function (o) {
          return (!o.active && vm.item.speciality && vm.item.speciality.employee_area && vm.item.speciality.employee_area.id && o.id != vm.item.speciality.employee_area.id) || !o.active;
        });


        // init employee area from employee data
        if (!vm.item.speciality) {
          vm.item.speciality = {};
          if (!vm.item.speciality.employee_area) {
            vm.item.speciality.employee_area = {
              id: $rootScope.currentUser.employee.employee_area.id
            }
          }
        }
      }).catch(function (response) {
        ToastService.showError(MESSAGES.imposibleToFetch + 'areas');
      });
    }

    function getSpecialities() {
      if (vm.item.speciality && vm.item.speciality.employee_area && vm.item.speciality.employee_area.id) {
        var employeeArea = _.find(vm.employeeAreas, function (o) {
          return o.id == vm.item.speciality.employee_area.id;
        });

        vm.specialities = employeeArea ? employeeArea.specialities : [];

        _.remove(vm.specialities, function (o) {
          var isActive = o.active;
          var isAreaActive = employeeArea.active;
          var isSameSpeciality = vm.item.speciality && o.id == vm.item.speciality.id;


          return !isAreaActive && !isSameSpeciality || !isActive && !isSameSpeciality;
        });

      } else {
        vm.specialities = [];
      }
    }

    function initWorkAutocomplete() {
      vm.inputForm.work = {};
      if (vm.new) {
        vm.inputForm.work.searchText = '';
        vm.inputForm.work.selected = null;
      } else {
        vm.inputForm.work.searchText = getWorkDisplayName(vm.item.work);
        vm.inputForm.work.selected = vm.item.work;
      }
    }

    function getParametersForSave() {
      var params = {};

      if (vm.new) {
        params.minutes = (vm.clock.value.hour() * 60) + vm.clock.value.minute();
        params.date = hourAssignment.date;
        params.observations = vm.item.observations;
        params.place_id = vm.item.place.id;
        params.activity_id = vm.item.activity.id;
        params.speciality_id = vm.item.speciality.id;
        params.work_id = vm.inputForm.work.selected.id;
      } else {
        params.minutes = (vm.clock.value.hour() * 60) + vm.clock.value.minute() != item.minutes ? (vm.clock.value.hour() * 60) + vm.clock.value.minute() : undefined;
        params.date = vm.item.date != item.date ? vm.item.date : undefined;
        params.observations = vm.item.observations != item.observations ? vm.item.observations : undefined;
        params.place_id = vm.item.place.id != item.place.id ? vm.item.place.id : undefined;
        params.activity_id = vm.item.activity.id != item.activity.id ? vm.item.activity.id : undefined;
        params.speciality_id = vm.item.speciality.id != item.speciality.id ? vm.item.speciality.id : undefined;
        params.work_id = vm.inputForm.work.selected.id ? vm.inputForm.work.selected.id : vm.item.work.id;
      }

      return params;
    }

    function update() {
      var tosave = getParametersForSave();
      return HourAssignmentsService.update(item.id, tosave).then(function () {
        ToastService.show(MESSAGES.savedSuccessfuly);
        close();
      }).catch(function (response) {
        ToastService.showError(MESSAGES.somethingHapped + " " + MESSAGES.imposibleToSave);
      });
    }

    function create() {
      vm.ui.loading = true;
      var tosave = getParametersForSave();
      return HourAssignmentsService.create(tosave).then(function () {
        ToastService.show(MESSAGES.savedSuccessfuly);
        close();
      }).catch(function (response) {
        ToastService.showError(MESSAGES.somethingHapped + " " + MESSAGES.imposibleToSave);
        vm.ui.loading = false;
      });
    }

    function close() {
      callback();
      $mdDialog.hide();
    }

    function parseMinutes(minutes) {
      var h = Math.floor(minutes / 60);
      var m = minutes % 60;

      return {
        hours: h,
        minutes: m
      }
    }

    ///////////// UI FUNCTIONS

    function filterWorks(query) {
      if (query != '') {
        var items = [];
        _.forEach(vm.works, function (item) {
          var queryLowerCase = angular.lowercase(query);
          var filterCondition = angular.lowercase(item.name).startsWith(queryLowerCase)
            || (item.id + '').startsWith(queryLowerCase);


          if (filterCondition) {
            items.push(item);
          }
        });

        return items;
      } else {
        return vm.works;
      }
    }

    function getWorkDisplayName(work) {
      return '# ' + work.id + ' - ' + work.name;
    }

    function areHoursAndMinutesValid() {
      if (vm.new) {
        return (vm.clock.value.hour() * 60) + vm.clock.value.minute() <= hourAssignment.minutes_to_assign;
      } else {
        return (vm.clock.value.hour() * 60) + vm.clock.value.minute() <= hourAssignment.minutes_to_assign + item.minutes;
      }
    }

    function cancel() {
      $mdDialog.cancel();
    }

    function remove() {
      var confirm = $mdDialog.confirm()
        .title('¿Está seguro que desea eliminar?')
        .targetEvent(event).ok(MESSAGES.yes).cancel(MESSAGES.no);

      $mdDialog.show(confirm).then(function () {
        HourAssignmentsService.destroy(vm.item.id).then(function () {
          ToastService.show(MESSAGES.removedSuccessfuly);
          callback();
        }).catch(function (response) {
          ToastService.showError(MESSAGES.somethingHapped + " " + MESSAGES.imposibleToRemove);
        });
      });
    }

  }
})();
