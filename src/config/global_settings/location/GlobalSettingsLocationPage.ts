export const ConfigGlobalSettingsLocationStateName: string = 'app.global_settings.location';

class GlobalSettingsLocationPageController implements ng.IController {
    public $onInit() { }
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

function configureGlobalSettingsLocationRoute(
    $injector: angular.auto.IInjectorService,
    $stateProvider: pip.rest.IAuthStateService
) {
    "ngInject";

    $stateProvider
        .state(ConfigGlobalSettingsLocationStateName, {
            url: '/location',
            controller: GlobalSettingsLocationPageController,
            auth: true,
            controllerAs: '$ctrl',
            templateUrl: 'config/global_settings/location/GlobalSettingsLocationPage.html'
        });
}

function configureGlobalSettingsLocationAccess(
    iqsAccessConfigProvider: iqs.shell.IAccessConfigProvider
) {
    "ngInject";

    let accessLevel: number = iqs.shell.AccessRole.admin;
    let accessConfig: any = {

    }

    iqsAccessConfigProvider.registerStateAccess(ConfigGlobalSettingsLocationStateName, accessLevel);

    iqsAccessConfigProvider.registerStateConfigure(ConfigGlobalSettingsLocationStateName, accessConfig);
}

(() => {

    angular
        .module('iqsGlobalSettings.Location', ['pipNav'])
        .config(configureGlobalSettingsLocationRoute)
        .config(configureGlobalSettingsLocationAccess);
})();
