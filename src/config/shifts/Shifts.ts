export const ConfigShiftsStateName: string = 'app.shifts';

class ConfigShiftsController implements ng.IController {
    public $onInit() { }
    private cf: Function[] = [];

    constructor(
        private $window: ng.IWindowService,
        private $scope: ng.IScope,
        private $state: ng.ui.IStateService,
        private $rootScope: ng.IRootScopeService,
        $injector: angular.auto.IInjectorService,
        private pipMedia: pip.layouts.IMediaService,
        private pipNavService: pip.nav.INavService,
        private $location: ng.ILocationService,
        iqsAccessConfig: iqs.shell.IAccessConfigService
    ) {
        "ngInject";

        this.appHeader();
        this.cf.push($rootScope.$on(pip.services.IdentityChangedEvent, () => {
            this.appHeader();
        }));
        this.cf.push($rootScope.$on('pipMainResized', () => {
            this.changeAppBar();
        }));
        this.cf.push($rootScope.$on('iqsChangeNav', () => {
            this.changeAppBar();
        }));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    private appHeader(): void {
        this.pipNavService.appbar.addShadow();
        this.pipNavService.appbar.parts = { 'icon': true, 'actions': 'primary', 'menu': true, 'title': 'breadcrumb', 'sites': this.pipMedia('gt-sm') };
        this.changeAppBar();
        this.pipNavService.actions.hide();
    }

    public onRetry() {
        this.$window.history.back();
    }

    private toMainFromDetails() {
        this.$location.search('details', 'main');
        this.$rootScope.$broadcast('iqsChangeNavPage');
        this.changeAppBar();
    }

    public changeAppBar() {
        this.pipNavService.appbar.part('sites', this.pipMedia('gt-sm'));
        this.pipNavService.breadcrumb.text = 'SHIFTS';
        this.pipNavService.breadcrumb.breakpoint = 'gt-sm';

        if (!this.pipMedia('gt-sm')) {
            if (this.$location.search().edit == 'data' && this.$location.search().details == 'details') {

                this.pipNavService.breadcrumb.items = [
                    <pip.nav.BreadcrumbItem>{
                        title: "SHIFTS", click: () => {
                            this.toMainFromDetails();
                        }
                    },
                    <pip.nav.BreadcrumbItem>{
                        title: "MONITORING_SHIFTS_DETAILS", click: () => {
                        }
                    }
                ];
                this.pipNavService.icon.showBack(() => {
                    this.toMainFromDetails();
                });

            } else {
                this.pipNavService.icon.showMenu();
            }

            if (this.$location.search().edit == 'edit') {
                if (!this.pipMedia('gt-sm')) {
                    this.pipNavService.icon.showBack(() => {
                        this.$location.search('details', 'main');
                        this.$location.search('edit', 'data');
                        this.$rootScope.$broadcast('iqsChangeNavPage');
                        this.changeAppBar();
                    });
                } else {
                    this.pipNavService.icon.showMenu();
                }
                this.pipNavService.breadcrumb.items = [
                    <pip.nav.BreadcrumbItem>{
                        title: "MONITORING_SHIFTS_DETAILS", click: () => {
                            this.$location.search('details', 'main');
                            this.$location.search('edit', 'data');
                            this.$rootScope.$broadcast('iqsChangeNavPage');
                            this.changeAppBar();
                        }
                    },
                    <pip.nav.BreadcrumbItem>{
                        title: "EDIT", click: () => {

                        }
                    }
                ];
            }


            if (this.$location.search().edit == 'add') {
                if (!this.pipMedia('gt-sm')) {
                    this.pipNavService.icon.showBack(() => {
                        this.$location.search('details', 'main');
                        this.$location.search('edit', 'data');
                        this.$rootScope.$broadcast('iqsChangeNavPage');
                        this.changeAppBar();
                    });
                } else {
                    this.pipNavService.icon.showMenu();
                }
                this.pipNavService.breadcrumb.items = [
                    <pip.nav.BreadcrumbItem>{
                        title: "MONITORING_SHIFTS_DETAILS", click: () => {
                            this.$location.search('details', 'main');
                            this.$location.search('edit', 'data');
                            this.$rootScope.$broadcast('iqsChangeNavPage');
                            this.changeAppBar();
                        }
                    },
                    <pip.nav.BreadcrumbItem>{
                        title: "ADD", click: () => {

                        }
                    }
                ];
            }
        } else {
            this.pipNavService.icon.showMenu();
        }
    }

}

function configureConfigShiftsRoute(
    $injector: angular.auto.IInjectorService,
    $stateProvider: pip.rest.IAuthStateService
) {
    "ngInject";

    $stateProvider
        .state(ConfigShiftsStateName, {
            url: '/shifts?shift_id&edit&details',
            reloadOnSearch: false,
            controller: ConfigShiftsController,
            auth: true,
            controllerAs: '$ctrl',
            templateUrl: 'config/shifts/Shifts.html'
        });
}

function configureConfigShiftsAccess(
    iqsAccessConfigProvider: iqs.shell.IAccessConfigProvider
) {
    "ngInject";

    let accessLevel: number = iqs.shell.AccessRole.manager;
    let accessConfig: any = {
        addShift: iqs.shell.AccessRole.manager,
        editShift: iqs.shell.AccessRole.manager,
        deleteShift: iqs.shell.AccessRole.manager
    }
    iqsAccessConfigProvider.registerStateAccess(ConfigShiftsStateName, accessLevel);
    iqsAccessConfigProvider.registerStateConfigure(ConfigShiftsStateName, accessConfig);
}

(() => {

    angular
        .module('iqsConfigShifts', ['pipNav', 'iqsShifts.ViewModel', 'iqsAccessConfig', 'iqsConfigShiftsPanel'])
        .config(configureConfigShiftsRoute)
        .config(configureConfigShiftsAccess);

})();
