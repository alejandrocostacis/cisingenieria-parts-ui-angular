(function ()
{
    'use strict';

    angular
        .module('uiPartsApp')
        .controller('MainController', MainController);

    /** @ngInject */
    function MainController($scope, $rootScope, $state)
    {

        // Data
        if(!$rootScope.currentUser){
          $state.go('app.login');
        }
        //////////

        // Remove the splash screen
        $scope.$on('$viewContentAnimationEnded', function (event)
        {
            if ( event.targetScope.$id === $scope.$id )
            {
                $rootScope.$broadcast('msSplashScreen::remove');
            }
        });
    }
})();
