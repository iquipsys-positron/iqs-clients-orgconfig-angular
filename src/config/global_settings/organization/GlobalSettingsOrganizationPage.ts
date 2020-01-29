export const ConfigGlobalSettingsOrganizationStateName: string = 'app.global_settings.organization';

class GlobalSettingsOrganizationPageController implements ng.IController {
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

function configureGlobalSettingsOrganizationRoute(
    $injector: angular.auto.IInjectorService,
    $stateProvider: pip.rest.IAuthStateService
) {
    "ngInject";

    $stateProvider
        .state(ConfigGlobalSettingsOrganizationStateName, {
            url: '/organization',
            controller: GlobalSettingsOrganizationPageController,
            auth: true,
            controllerAs: '$ctrl',
            templateUrl: 'config/global_settings/organization/GlobalSettingsOrganizationPage.html'
        });
}

function configureGlobalSettingsOrganizationAccess(
    iqsAccessConfigProvider: iqs.shell.IAccessConfigProvider
) {
    "ngInject";

    let accessLevel: number = iqs.shell.AccessRole.admin;
    let accessConfig: any = {

    }

    iqsAccessConfigProvider.registerStateAccess(ConfigGlobalSettingsOrganizationStateName, accessLevel);

    iqsAccessConfigProvider.registerStateConfigure(ConfigGlobalSettingsOrganizationStateName, accessConfig);
}

(() => {

    angular
        .module('iqsGlobalSettings.Organization', ['pipNav'])
        .config(configureGlobalSettingsOrganizationRoute)
        .config(configureGlobalSettingsOrganizationAccess);
})();
