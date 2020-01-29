export const ConfigGlobalSettingsPaymentsStateName: string = 'app.global_settings.payments';

class GlobalSettingsPaymentsPageController implements ng.IController {
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

function configureGlobalSettingsPaymentsRoute(
    $injector: angular.auto.IInjectorService,
    $stateProvider: pip.rest.IAuthStateService
) {
    "ngInject";

    $stateProvider
        .state(ConfigGlobalSettingsPaymentsStateName, {
            url: '/payments',
            controller: GlobalSettingsPaymentsPageController,
            auth: true,
            controllerAs: '$ctrl',
            templateUrl: 'config/global_settings/payments/GlobalSettingsPaymentsPage.html'
        });
}

function configureGlobalSettingsPaymentsAccess(
    iqsAccessConfigProvider: iqs.shell.IAccessConfigProvider
) {
    "ngInject";

    let accessLevel: number = iqs.shell.AccessRole.admin;
    let accessConfig: any = {

    }

    iqsAccessConfigProvider.registerStateAccess(ConfigGlobalSettingsPaymentsStateName, accessLevel);

    iqsAccessConfigProvider.registerStateConfigure(ConfigGlobalSettingsPaymentsStateName, accessConfig);
}

(() => {

    angular
        .module('iqsGlobalSettings.Payments', ['pipNav'])
        .config(configureGlobalSettingsPaymentsRoute)
        .config(configureGlobalSettingsPaymentsAccess);
})();
