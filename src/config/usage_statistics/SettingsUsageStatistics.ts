export const ConfigUsageStatisticsStateName: string = 'app.usage_statistics';

class ConfigUsageStatisticsController implements ng.IController {
    public $onInit() { }
    private cleanUpFunc: Function;
    constructor(
        private $window: ng.IWindowService,
        $scope: ng.IScope,
        private $state: ng.ui.IStateService,
        private $rootScope: ng.IRootScopeService,
        private pipMedia: pip.layouts.IMediaService,
        $injector: angular.auto.IInjectorService,
        private pipNavService: pip.nav.INavService,
        iqsAccessConfig: iqs.shell.IAccessConfigService
    ) {
        "ngInject";

        this.appHeader();
        $rootScope.$on(pip.services.IdentityChangedEvent, () => {
            this.appHeader();
        });

        $scope.$on('$destroy', () => {
            if (angular.isFunction(this.cleanUpFunc)) {
                this.cleanUpFunc();
            }
        });
    }

    private toMainFromDetails() {

    }

    private appHeader(): void {
        this.pipNavService.appbar.addShadow();
        this.pipNavService.appbar.parts = { 'icon': true, 'actions': 'primary', 'menu': true, 'title': 'breadcrumb', 'sites': this.pipMedia('gt-sm') };
        this.pipNavService.actions.hide();
        this.pipNavService.appbar.removeShadow();
        this.pipNavService.breadcrumb.breakpoint = 'gt-sm';
        this.pipNavService.breadcrumb.text = 'USAGE_STATISTICS';
        this.pipNavService.actions.hide();
    }

    public onRetry() {
        this.$window.history.back();
    }
}

function configureConfigUsageStatisticsRoute(
    $injector: angular.auto.IInjectorService,
    $stateProvider: pip.rest.IAuthStateService
) {
    "ngInject";

    $stateProvider
        .state(ConfigUsageStatisticsStateName, {
            url: '/usage?type&date&device_stat_id',
            controller: ConfigUsageStatisticsController,
            auth: true,
            reloadOnSearch: false,
            controllerAs: '$ctrl',
            templateUrl: 'config/usage_statistics/SettingsUsageStatistics.html'
        });
}

function configureConfigUsageStatisticsAccess(
    iqsAccessConfigProvider: iqs.shell.IAccessConfigProvider
) {
    "ngInject";

    let accessLevel: number = iqs.shell.AccessRole.manager;
    let accessConfig: any = {}
    iqsAccessConfigProvider.registerStateAccess(ConfigUsageStatisticsStateName, accessLevel);
    iqsAccessConfigProvider.registerStateConfigure(ConfigUsageStatisticsStateName, accessConfig);
}

(() => {

    angular
        .module('iqsConfigUsageStatistics', ['pipNav', 'iqsSettingsUsageStatisticsPanel'])
        .config(configureConfigUsageStatisticsRoute)
        .config(configureConfigUsageStatisticsAccess);

})();
