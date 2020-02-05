interface IGlobalSettingsParametrsPanelBindings {
    [key: string]: any;
}

const GlobalSettingsParametrsPanelBindings: IGlobalSettingsParametrsPanelBindings = {}

class GlobalSettingsParametrsPanelChanges implements ng.IOnChangesObject, IGlobalSettingsParametrsPanelBindings {
    [key: string]: ng.IChangesObject<any>;
}

class GlobalSettingsParametrsPanelController implements ng.IController {
    public $onInit() { }
    public site: iqs.shell.Organization;
    public dataRateValues: number[] = [0, 1, 2, 3, 4, 5, 6];

    public purpouseCollection: any[] = [
        {
            title: 'GLOBAL_SETTINGS_PARAMETERS_MAIN_POINT_SAFE',
            id: 'safe'
        },
        {
            title: 'GLOBAL_SETTINGS_PARAMETERS_MAIN_POINT_CONTROL',
            id: 'control'
        },
        {
            title: 'GLOBAL_SETTINGS_PARAMETERS_MAIN_POINT_SAFE_CONTROL',
            id: 'safe and control'
        }
    ];
    public onChangeOrganization: () => void;
    private transaction: pip.services.Transaction;
    private cf: Function[] = [];

    constructor(
        $rootScope: ng.IRootScopeService,
        private $state: ng.ui.IStateService,
        private iqsOrganization: iqs.shell.IOrganizationService,
        private iqsOrganizationsViewModel: iqs.shell.IOrganizationsViewModel,
        private pipTransaction: pip.services.ITransactionService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        this.transaction = pipTransaction.create('sites');
        const runWhenReady = () => {
            this.site = _.cloneDeep(this.iqsOrganizationsViewModel.getOrganizationById(this.iqsOrganization.organization.id));
            this.onChangeOrganization = this.updateOrganization;
        };

        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady));
    }

    public $onDestroy() {
        this.updateOrganization();
        for (const f of this.cf) { f(); }
    }

    private updateOrganization(): void {
        this.transaction.begin('update_site');
        this.iqsOrganizationsViewModel.updateOrganization(
            this.site,
            (site: iqs.shell.Organization) => {
                this.iqsOrganization.updateOrganization(site);
                this.site = _.cloneDeep(site);
                this.transaction.end();
            },
            (err: any) => {
                this.transaction.end(err);
            }
        );
    }
}

function configureConfigGlobalParametersTranslations(
    pipTranslateProvider: pip.services.ITranslateProvider
) {
    pipTranslateProvider.translations('en', {
        GLOBAL_SETTINGS_PARAMETERS_ORG_SIZE: 'Organization size',
        GLOBAL_SETTINGS_PARAMETERS_ORG_SIZE_SMALL_100: 'less than 100 employees',
        GLOBAL_SETTINGS_PARAMETERS_ORG_SIZE_100_500: '100 - 500 employees',
        GLOBAL_SETTINGS_PARAMETERS_ORG_SIZE_500_1000: '500 - 1000 employees',
        GLOBAL_SETTINGS_PARAMETERS_ORG_SIZE_1000_10000: '1000 - 10000 employees',
        GLOBAL_SETTINGS_PARAMETERS_ORG_SIZE_MORE_10000: 'more than 10000 employees',

        GLOBAL_SETTINGS_PARAMETERS_TOTAL_SIZE: 'Total number of sites',
        GLOBAL_SETTINGS_PARAMETERS_TOTAL_SIZE_1: '1',
        GLOBAL_SETTINGS_PARAMETERS_TOTAL_SIZE_2: '2',
        GLOBAL_SETTINGS_PARAMETERS_TOTAL_SIZE_3: '3',
        GLOBAL_SETTINGS_PARAMETERS_TOTAL_SIZE_4: '4',
        GLOBAL_SETTINGS_PARAMETERS_TOTAL_SIZE_5: '5 - 10',
        GLOBAL_SETTINGS_PARAMETERS_TOTAL_SIZE_10: 'more than 10',

        GLOBAL_SETTINGS_PARAMETERS_INDUSTRY: 'Industry',
        GLOBAL_SETTINGS_PARAMETERS_INDUSTRY_MINING: 'Mining',
        GLOBAL_SETTINGS_PARAMETERS_INDUSTRY_QUARRIES: 'Quarries',
        GLOBAL_SETTINGS_PARAMETERS_INDUSTRY_OIL: 'Oil & gas',
        GLOBAL_SETTINGS_PARAMETERS_INDUSTRY_CIVIL: 'Civil and industrial construction',
        GLOBAL_SETTINGS_PARAMETERS_INDUSTRY_ROAD: 'Road construction',
        GLOBAL_SETTINGS_PARAMETERS_INDUSTRY_TOURISM: 'Tourism & recreation',
        GLOBAL_SETTINGS_PARAMETERS_INDUSTRY_OTHER: 'Other',

        GLOBAL_SETTINGS_PARAMETERS_MAIN_POINT: 'System purpose',
        GLOBAL_SETTINGS_PARAMETERS_MAIN_POINT_SAFE: 'Safety',
        GLOBAL_SETTINGS_PARAMETERS_MAIN_POINT_CONTROL: 'Production control',
        GLOBAL_SETTINGS_PARAMETERS_MAIN_POINT_SAFE_CONTROL: 'Safety and control',


        GLOBAL_SETTINGS_PARAMETERS_TIME_ACTIVE: 'Comm interval for active objects (sec)',
        GLOBAL_SETTINGS_PARAMETERS_TIME_INACTIVE: 'Comm interval for inactive objects (sec)',
        GLOBAL_SETTINGS_PARAMETERS_TIME_OUTSIDE: 'Comm interval offsite (sec)',

        GLOBAL_SETTINGS_PARAMETERS_TIME_DELAY: 'Offline timeout (sec)',
        GLOBAL_SETTINGS_PARAMETERS_TIME: 'Data rate',


    });

    pipTranslateProvider.translations('ru', {

        GLOBAL_SETTINGS_PARAMETERS_ORG_SIZE: 'Размер огранизации',
        GLOBAL_SETTINGS_PARAMETERS_ORG_SIZE_SMALL_100: 'менее 100 сотрудников',
        GLOBAL_SETTINGS_PARAMETERS_ORG_SIZE_100_500: '100 - 500 сотрудников',
        GLOBAL_SETTINGS_PARAMETERS_ORG_SIZE_500_1000: '500 - 1000 сотрудников',
        GLOBAL_SETTINGS_PARAMETERS_ORG_SIZE_1000_10000: '1000 - 10000 сотрудников',
        GLOBAL_SETTINGS_PARAMETERS_ORG_SIZE_MORE_10000: 'более 10000 сотрудников',

        GLOBAL_SETTINGS_PARAMETERS_TOTAL_SIZE: 'Общее количество рабочих площадок',
        GLOBAL_SETTINGS_PARAMETERS_TOTAL_SIZE_1: '1',
        GLOBAL_SETTINGS_PARAMETERS_TOTAL_SIZE_2: '2',
        GLOBAL_SETTINGS_PARAMETERS_TOTAL_SIZE_3: '3',
        GLOBAL_SETTINGS_PARAMETERS_TOTAL_SIZE_4: '4',
        GLOBAL_SETTINGS_PARAMETERS_TOTAL_SIZE_5: '5 - 10',
        GLOBAL_SETTINGS_PARAMETERS_TOTAL_SIZE_10: 'более 10',

        GLOBAL_SETTINGS_PARAMETERS_INDUSTRY: 'Индустрия',
        GLOBAL_SETTINGS_PARAMETERS_INDUSTRY_MINING: 'Горнодобывающая',
        GLOBAL_SETTINGS_PARAMETERS_INDUSTRY_QUARRIES: 'Карьеры строительных материалов',
        GLOBAL_SETTINGS_PARAMETERS_INDUSTRY_OIL: 'Нефтегазовая',
        GLOBAL_SETTINGS_PARAMETERS_INDUSTRY_CIVIL: 'Гражданское и промышленное строительство',
        GLOBAL_SETTINGS_PARAMETERS_INDUSTRY_ROAD: 'Дорожное строительство',
        GLOBAL_SETTINGS_PARAMETERS_INDUSTRY_TOURISM: 'Туризм и отдых',
        GLOBAL_SETTINGS_PARAMETERS_INDUSTRY_OTHER: 'Другая',

        GLOBAL_SETTINGS_PARAMETERS_MAIN_POINT: 'Основное назначение системы',
        GLOBAL_SETTINGS_PARAMETERS_MAIN_POINT_SAFE: 'Обеспечение безопасности',
        GLOBAL_SETTINGS_PARAMETERS_MAIN_POINT_CONTROL: 'Контроль производства',
        GLOBAL_SETTINGS_PARAMETERS_MAIN_POINT_SAFE_CONTROL: 'Безопасность и контроль',

        GLOBAL_SETTINGS_PARAMETERS_TIME_ACTIVE: 'Частота передачи для активных объектов (сек)',
        GLOBAL_SETTINGS_PARAMETERS_TIME_INACTIVE: 'Частота передачи для неактивных объектов (сек)',
        GLOBAL_SETTINGS_PARAMETERS_TIME_OUTSIDE: 'Частота передачи вне площадки (сек)',

        GLOBAL_SETTINGS_PARAMETERS_TIME_DELAY: 'Задержка до отключения (сек)',
        GLOBAL_SETTINGS_PARAMETERS_TIME: 'Режим передачи',
    });
}

(() => {
    angular
        .module('iqsGlobalSettingsParametrsPanel', [])
        .component('iqsGlobalSettingsParametrsPanel', {
            bindings: GlobalSettingsParametrsPanelBindings,
            templateUrl: 'config/global_settings/parametrs/GlobalSettingsParametrsPanel.html',
            controller: GlobalSettingsParametrsPanelController,
            controllerAs: '$ctrl'
        })
        .config(configureConfigGlobalParametersTranslations)
})();


