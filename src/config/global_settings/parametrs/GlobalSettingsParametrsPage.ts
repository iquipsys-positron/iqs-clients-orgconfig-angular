export const ConfigGlobalSettingsParametrsStateName: string = 'app.global_settings.parametrs';

class GlobalSettingsParametrsPageController implements ng.IController {
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

function configureGlobalSettingsParametrsRoute(
    $injector: angular.auto.IInjectorService,
    $stateProvider: pip.rest.IAuthStateService
) {
    "ngInject";

    $stateProvider
        .state(ConfigGlobalSettingsParametrsStateName, {
            url: '/parametrs',
            controller: GlobalSettingsParametrsPageController,
            auth: true,
            controllerAs: '$ctrl',
            templateUrl: 'config/global_settings/parametrs/GlobalSettingsParametrsPage.html'
        });
}

function configureGlobalSettingsParametrsAccess(
    iqsAccessConfigProvider: iqs.shell.IAccessConfigProvider
) {
    "ngInject";

    let accessLevel: number = iqs.shell.AccessRole.admin;
    let accessConfig: any = {

    }

    iqsAccessConfigProvider.registerStateAccess(ConfigGlobalSettingsParametrsStateName, accessLevel);

    iqsAccessConfigProvider.registerStateConfigure(ConfigGlobalSettingsParametrsStateName, accessConfig);
}

(() => {

    angular
        .module('iqsGlobalSettings.Parametrs', ['pipNav'])
        .config(configureGlobalSettingsParametrsRoute)
        .config(configureGlobalSettingsParametrsAccess);
})();
