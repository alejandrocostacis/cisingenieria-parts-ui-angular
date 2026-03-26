(function () {
  'use strict';

  angular
    .module('uiPartsApp')
    .config(config);

  /** @ngInject */
  function config(
    $mdDateLocaleProvider,
    $authProvider,
    localStorageServiceProvider,
    APP_NAME,
    ENVIRONMENT
  ) {
    $mdDateLocaleProvider.months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    $mdDateLocaleProvider.shortMonths = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    $mdDateLocaleProvider.days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    $mdDateLocaleProvider.shortDays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

    // Can change week display to start on Monday.
    $mdDateLocaleProvider.firstDayOfWeek = 1;

    // Example uses moment.js to parse and format dates.
    $mdDateLocaleProvider.parseDate = function (dateString) {
      var m = moment(dateString, 'DD/MM/YYYY', true);
      return m.isValid() ? m.toDate() : new Date(NaN);
    };

    $mdDateLocaleProvider.formatDate = function (date) {
      var m = moment(date);
      return m.isValid() ? m.format('DD/MM/YYYY') : '';
    };

    $mdDateLocaleProvider.monthHeaderFormatter = function (date) {
      return $mdDateLocaleProvider.shortMonths[date.getMonth()] + ' ' + date.getFullYear();
    };

    // In addition to date display, date components also need localized messages
    // for aria-labels for screen-reader users.

    $mdDateLocaleProvider.weekNumberFormatter = function (weekNumber) {
      return 'Semana ' + weekNumber;
    };

    $mdDateLocaleProvider.msgCalendar = 'Calendario';
    $mdDateLocaleProvider.msgOpenCalendar = 'Abre el calendario';

    // You can also set when your calendar begins and ends.
    $mdDateLocaleProvider.firstRenderableDate = new Date(2012, 11, 21);
    // $mdDateLocaleProvider.lastRenderableDate = new Date(2012, 11, 21);

    // ################### Storage service configs ####################
    localStorageServiceProvider
      .setPrefix(APP_NAME)
      .setStorageCookieDomain(ENVIRONMENT.domain)
      .setNotify(true, true);

    // ################### Auth configs #####################
    $authProvider.configure({
      // EnvironmentConfig
      apiUrl: ENVIRONMENT.apiUrl,
      storage: 'sessionStorage',
      signOutUrl: '/auth/sign_out',
      emailSignInPath: '/auth/sign_in',
      emailRegistrationPath: '/auth',
      accountUpdatePath: '/auth',
      accountDeletePath: '/auth',
      passwordResetPath: '/auth/password',
      passwordUpdatePath: '/auth/password',
      tokenValidationPath: '/auth/validate_token'
    })
  }
})();
