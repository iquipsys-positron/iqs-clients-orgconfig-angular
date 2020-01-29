export const ConfigGlobalSettingsMapStateName: string = 'app.global_settings.map';

class GlobalSettingsMapPageController implements ng.IController {          public $onInit() {}
   
    constructor(
        private $window: ng.IWindowService,
        $scope: ng.IScope,
        private $state: ng.ui.IStateService,
        $rootScope: ng.IRootScopeService,
        $mdMedia: angular.material.IMedia,
        $injector: angular.auto.IInjectorService,
        private pipNavService: pip.nav.INavService
    ) {
        "ngInject";

        let pipMedia = $injector.has('pipMedia') ? $injector.get('pipMedia') : null;

    }
}

function configureGlobalSettingsMapRoute(
    $injector: angular.auto.IInjectorService,
    $stateProvider: pip.rest.IAuthStateService
) {
    "ngInject";

    $stateProvider
        .state(ConfigGlobalSettingsMapStateName, {
            url: '/map',
            controller: GlobalSettingsMapPageController,
            auth: true,
            controllerAs: '$ctrl',
            templateUrl: 'config/global_settings/map/GlobalSettingsMapPage.html'
        });
}

function configureGlobalSettingsMapAccess(
    iqsAccessConfigProvider: iqs.shell.IAccessConfigProvider
) {
    "ngInject";

    let accessLevel: number =  iqs.shell.AccessRole.admin;
    let accessConfig: any = {
        
            }

    iqsAccessConfigProvider.registerStateAccess(ConfigGlobalSettingsMapStateName, accessLevel);

    iqsAccessConfigProvider.registerStateConfigure(ConfigGlobalSettingsMapStateName, accessConfig);
}

(() => {

    angular
        .module('iqsGlobalSettings.Map', ['pipNav'])
        .config(configureGlobalSettingsMapRoute)
        .config(configureGlobalSettingsMapAccess);
})();
