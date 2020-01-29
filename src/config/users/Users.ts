export const ConfigUsersStateName: string = 'app.users';

class ConfigUsersController implements ng.IController {
    public $onInit() { }
    private cf: Function[] = [];
    constructor(
        private $window: ng.IWindowService,
        $scope: ng.IScope,
        private $state: ng.ui.IStateService,
        private $rootScope: ng.IRootScopeService,
        private pipMedia: pip.layouts.IMediaService,
        private $location: ng.ILocationService,
        $injector: angular.auto.IInjectorService,
        private pipNavService: pip.nav.INavService,
        iqsAccessConfig: iqs.shell.IAccessConfigService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";


        this.appHeader();
        this.cf.push($rootScope.$on(pip.services.IdentityChangedEvent, () => {
            this.appHeader();
        }));
        this.cf.push($rootScope.$on('pipMainResized', () => {
            this.appHeader();
        }));
        this.cf.push($rootScope.$on('iqsChangeNav', () => {
            this.appHeader();
        }));
        if (this.iqsLoading.isDone) { iqsAccessConfig.getStateAccess(ConfigUsersStateName); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, () => { iqsAccessConfig.getStateAccess(ConfigUsersStateName); }));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    private toMainFromDetails() {
        this.$location.search('details', 'main');
        this.$rootScope.$broadcast('iqsChangeNavPage');
        this.appHeader();
    }

    private appHeader(): void {
        this.pipNavService.appbar.addShadow();
        this.pipNavService.appbar.parts = { 'icon': true, 'actions': 'primary', 'menu': true, 'title': 'breadcrumb', 'sites': this.pipMedia('gt-sm') };
        this.pipNavService.actions.hide();
        this.pipNavService.appbar.removeShadow();
        this.pipNavService.breadcrumb.breakpoint = 'gt-sm';
        this.pipNavService.icon.showMenu();
        this.pipNavService.breadcrumb.text = 'ADMINISTRATION_USERS';
        this.pipNavService.actions.hide();

        if (!this.pipMedia('gt-sm')) {
            if (this.$location.search().edit == 'data' && this.$location.search().details == 'details') {

                this.pipNavService.breadcrumb.items = [
                    <pip.nav.BreadcrumbItem>{
                        title: "ADMINISTRATION_USERS", click: () => {
                            this.toMainFromDetails();
                        }
                    },
                    <pip.nav.BreadcrumbItem>{
                        title: "ADMINISTRATION_USERS_DETAILS", click: () => {
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
                        this.appHeader();
                    });
                } else {
                    this.pipNavService.icon.showMenu();
                }
                this.pipNavService.breadcrumb.items = [
                    <pip.nav.BreadcrumbItem>{
                        title: "ADMINISTRATION_USERS", click: () => {
                            this.$location.search('details', 'main');
                            this.$location.search('edit', 'data');
                            this.$rootScope.$broadcast('iqsChangeNavPage');
                            this.appHeader();
                        }
                    },
                    <pip.nav.BreadcrumbItem>{
                        title: "ADMINISTRATION_USERS_EDIT", click: () => {

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
                        this.appHeader();
                    });
                } else {
                    this.pipNavService.icon.showMenu();
                }
                this.pipNavService.breadcrumb.items = [
                    <pip.nav.BreadcrumbItem>{
                        title: "ADMINISTRATION_USERS", click: () => {
                            this.$location.search('details', 'main');
                            this.$location.search('edit', 'data');
                            this.$rootScope.$broadcast('iqsChangeNavPage');
                            this.appHeader();
                        }
                    },
                    <pip.nav.BreadcrumbItem>{
                        title: "ADMINISTRATION_USERS_ADD", click: () => {

                        }
                    }
                ];
            }
        } else {
            this.pipNavService.icon.showMenu();
        }
    }

    public onRetry() {
        this.$window.history.back();
    }
}

function configureConfigUsersRoute(
    $injector: angular.auto.IInjectorService,
    $stateProvider: pip.rest.IAuthStateService
) {
    "ngInject";

    $stateProvider
        .state(ConfigUsersStateName, {
            url: '/users?user_id&account_id&details&edit&section',
            controller: ConfigUsersController,
            auth: true,
            reloadOnSearch: false,
            controllerAs: '$ctrl',
            templateUrl: 'config/users/Users.html'
        });
}

function configureConfigUsersAccess(
    iqsAccessConfigProvider: iqs.shell.IAccessConfigProvider
) {
    "ngInject";

    let accessLevel: number = iqs.shell.AccessRole.admin;
    let accessConfig: any = {
        addUser: iqs.shell.AccessRole.admin,
        deleteUser: iqs.shell.AccessRole.admin,
        changeUserRole: iqs.shell.AccessRole.admin,
        closeSession: iqs.shell.AccessRole.admin
    };
    iqsAccessConfigProvider.registerStateAccess(ConfigUsersStateName, accessLevel);
    iqsAccessConfigProvider.registerStateConfigure(ConfigUsersStateName, accessConfig);
}

(() => {

    angular
        .module('iqsConfigUsers', ['pipNav', 'iqsConfigUsersPanel', 'iqsConfigUserSessionsPanel'])
        .config(configureConfigUsersRoute)
        .config(configureConfigUsersAccess);

})();
