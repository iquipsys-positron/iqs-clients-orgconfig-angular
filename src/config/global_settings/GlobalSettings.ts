export const ConfigGlobalSettingsStateName: string = 'app.global_settings';

class ConfigGlobalSettingsSection {
    title: string;
    state: string;
    icon?: string;
}
class ConfigGlobalSettingsController implements ng.IController {
    public $onInit() { }

    public sections: ConfigGlobalSettingsSection[] = [
        {
            title: 'GLOBAL_SETTINGS_ORGANIZATION',
            icon: 'webui-icons:tag-all',
            state: 'app.global_settings.organization'
        },
        {
            title: 'GLOBAL_SETTINGS_PARAMETERS',
            icon: 'webui-icons:list',
            state: 'app.global_settings.parametrs'
        },
        {
            title: 'GLOBAL_SETTINGS_LOCATION',
            icon: 'iqs:location-1',
            state: 'app.global_settings.location'
        },
        {
            title: 'GLOBAL_SETTINGS_MAP',
            icon: 'webui-icons:map',
            state: 'app.global_settings.map'
        },
        {
            title: 'GLOBAL_SETTINGS_PAYMENTS',
            icon: 'iqs:pay-type',
            state: 'app.global_settings.payments'
        }
    ];
    public selectIndex: number = 0;
    public details: boolean = false;
    private mediaSizeGtSm: boolean;
    private cf: Function[] = [];

    constructor(
        private $window: ng.IWindowService,
        $scope: ng.IScope,
        private $state: ng.ui.IStateService,
        private $rootScope: ng.IRootScopeService,
        private $location: ng.ILocationService,
        $mdMedia: angular.material.IMedia,
        $injector: angular.auto.IInjectorService,
        private pipNavService: pip.nav.INavService,
        public pipMedia: pip.layouts.IMediaService,
        iqsAccessConfig: iqs.shell.IAccessConfigService
    ) {
        "ngInject";

        this.selectIndex = _.findIndex(this.sections, { state: $state.current.name });
        this.details = this.$location.search()['details'] === 'true' && !this.pipMedia('gt-sm');
        this.mediaSizeGtSm = this.pipMedia('gt-sm');
        this.cf.push(this.$rootScope.$on('pipMainResized', () => {
            if (this.mediaSizeGtSm !== this.pipMedia('gt-sm')) {
                this.mediaSizeGtSm = this.pipMedia('gt-sm');
                if (this.pipMedia('gt-sm')) {
                    this.details = false;
                }
                this.appHeader();
            }
        }));
        this.appHeader();
        this.cf.push($rootScope.$on(pip.services.IdentityChangedEvent, () => {
            this.appHeader();
        }));
        this.selectIndex = 0;
        this.$state.go('app.global_settings.organization', this.$state.params, {location: 'replace'});
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    public selectItem(index: number): void {
        this.selectIndex = index;
        this.$state.go(this.sections[this.selectIndex].state, {});
        if (!this.pipMedia('gt-sm')) {
            this.details = true;
            this.$location.search('details', this.details);
            this.appHeader();
        }
    }

    private toMainFromDetails() {
        this.details = false;
        this.$location.search('details', this.details);
        this.appHeader();
    }

    private appHeader(): void {
        this.pipNavService.appbar.parts = { 'icon': true, 'actions': 'primary', 'menu': true, 'title': 'breadcrumb', 'sites': this.pipMedia('gt-sm') };
        this.pipNavService.actions.hide();
        this.pipNavService.appbar.removeShadow();

        if (this.details) {
            this.pipNavService.breadcrumb.items = [
                <pip.nav.BreadcrumbItem>{
                    title: 'ORGANIZATION_PROFILE',
                    click: () => { this.toMainFromDetails(); }
                },
                <pip.nav.BreadcrumbItem>{
                    title: this.sections[this.selectIndex].title
                }
            ];
            this.pipNavService.icon.showBack(() => {
                this.toMainFromDetails();
            });
        } else {
            this.pipNavService.breadcrumb.text = 'ORGANIZATION_PROFILE';
            this.pipNavService.icon.showMenu();
        }

        this.pipNavService.actions.hide();
    }

    public onRetry() {
        this.$window.history.back();
    }
}

function configureConfigGlobalSettingsRoute(
    $injector: angular.auto.IInjectorService,
    $stateProvider: pip.rest.IAuthStateService
) {
    "ngInject";

    $stateProvider
        .state(ConfigGlobalSettingsStateName, {
            url: '/site?details',
            controller: ConfigGlobalSettingsController,
            auth: true,
            // abstract: true,
            controllerAs: '$ctrl',
            templateUrl: 'config/global_settings/GlobalSettings.html'
        });
}

function configureConfigGlobalTranslations(
    pipTranslateProvider: pip.services.ITranslateProvider
) {
    pipTranslateProvider.translations('en', {
        ADMINISTRATION_GLOBAL_SETTINGS: 'Global settings',
        ORGANIZATION_NAME: 'Organization name',
        ORGANIZATION_RADIUS: 'Organization radius',
        ORGANIZATION_PROFILE: 'Organization profile',
        GLOBAL_SETTINGS_ORGANIZATION: 'Organization',
        GLOBAL_SETTINGS_MAP: 'Map picture',
        GLOBAL_SETTINGS_LOCATION: 'Location',
        GLOBAL_SETTINGS_PARAMETERS: 'System parameters',
        GLOBAL_SETTINGS_PAYMENTS: 'Credit card',
        ADD_CENTER: 'Add center',
        REDRAW: 'Redraw center',
        GLOBAL_SETTINGS_MAP_LOAD: 'Load',
        GLOBAL_SETTINGS_MAP_DELETE: 'Delete',
        ORGANIZATION_CODE_FOUND_ERROR: 'A site with this code already exists',
        ORGANIZATION_CODE_REQUITED_ERROR: 'Organization code required',
        ORGANIZATION_ID: 'System identifier'
    });

    pipTranslateProvider.translations('ru', {
        ADMINISTRATION_GLOBAL_SETTINGS: 'Глобальные настройки',
        ORGANIZATION_NAME: 'Название площадки',
        ORGANIZATION_RADIUS: 'Радиус площадки',
        ORGANIZATION_PROFILE: 'Рабочая площадка',
        GLOBAL_SETTINGS_ORGANIZATION: 'Реквизиты организации',
        GLOBAL_SETTINGS_MAP: 'Изображение карты',
        GLOBAL_SETTINGS_LOCATION: 'Расположение',
        GLOBAL_SETTINGS_PARAMETERS: 'Системные параметры',
        GLOBAL_SETTINGS_PAYMENTS: 'Кредитная карта',
        ADD_CENTER: 'Добавить центр',
        REDRAW: 'Перерисовать центр',
        GLOBAL_SETTINGS_MAP_LOAD: 'Загрузить',
        GLOBAL_SETTINGS_MAP_DELETE: 'Удалить',
        ORGANIZATION_CODE_FOUND_ERROR: 'Сайт с таким кодом уже существует',
        ORGANIZATION_CODE_REQUITED_ERROR: 'Необходимо ввести код сайта',
        ORGANIZATION_ID: 'Системный идентификатор'
    });
}

function configureConfigGlobalSettingsAccess(
    iqsAccessConfigProvider: iqs.shell.IAccessConfigProvider
) {
    "ngInject";

    let accessLevel: number = iqs.shell.AccessRole.admin;
    let accessConfig: any = {}

    iqsAccessConfigProvider.registerStateAccess(ConfigGlobalSettingsStateName, accessLevel);
    iqsAccessConfigProvider.registerStateConfigure(ConfigGlobalSettingsStateName, accessConfig);
}

(() => {

    angular
        .module('iqsConfigGlobalSettings', ['pipNav',
            'iqsGlobalSettings.Map', 'iqsGlobalSettingsMapPanel',
            'iqsGlobalSettings.Organization', 'iqsGlobalSettingsOrganizationPanel',
            'iqsGlobalSettings.Location', 'iqsGlobalSettingsLocationPanel',
            'iqsGlobalSettings.Parametrs', 'iqsGlobalSettingsParametrsPanel',
            'iqsGlobalSettings.Payments', 'iqsGlobalSettingsPaymentsPanel'
        ])
        .config(configureConfigGlobalSettingsRoute)
        .config(configureConfigGlobalTranslations)
        .config(configureConfigGlobalSettingsAccess);
})();
