interface IGlobalSettingsOrganizationPanelBindings {
    [key: string]: any;
}

const GlobalSettingsOrganizationPanelBindings: IGlobalSettingsOrganizationPanelBindings = {}

class GlobalSettingsOrganizationPanelChanges implements ng.IOnChangesObject, IGlobalSettingsOrganizationPanelBindings {
    [key: string]: ng.IChangesObject<any>;
}

class GlobalSettingsOrganizationPanelController implements ng.IController {
    public $onInit() { }

    public onChangeOrganization: () => void;
    public site: iqs.shell.Organization;
    public picture: any;
    public onPictureChanged: (any) => void;

    public isCodeValidate: boolean = true;
    public error: string;
    public code: string;

    public industryCollection: any[] = [
        {
            id: 'Mining',
            title: 'GLOBAL_SETTINGS_PARAMETERS_INDUSTRY_MINING'
        },
        {
            id: 'Quarries',
            title: 'GLOBAL_SETTINGS_PARAMETERS_INDUSTRY_QUARRIES'
        },
        {
            id: 'Oil & gas',
            title: 'GLOBAL_SETTINGS_PARAMETERS_INDUSTRY_OIL'
        },
        {
            id: 'Civil and Industrial construction',
            title: 'GLOBAL_SETTINGS_PARAMETERS_INDUSTRY_CIVIL'
        },
        {
            id: 'Road construction',
            title: 'GLOBAL_SETTINGS_PARAMETERS_INDUSTRY_ROAD'
        },
        {
            id: 'Tourism & recreation',
            title: 'GLOBAL_SETTINGS_PARAMETERS_INDUSTRY_TOURISM'
        },
        {
            id: 'Other',
            title: 'GLOBAL_SETTINGS_PARAMETERS_INDUSTRY_OTHER'
        }
    ];
    public orgCollection: any[] = [
        {
            title: 'GLOBAL_SETTINGS_PARAMETERS_ORG_SIZE_SMALL_100',
            id: 0
        }, {
            title: 'GLOBAL_SETTINGS_PARAMETERS_ORG_SIZE_100_500',
            id: 100
        }, {
            title: 'GLOBAL_SETTINGS_PARAMETERS_ORG_SIZE_500_1000',
            id: 500
        }, {
            title: 'GLOBAL_SETTINGS_PARAMETERS_ORG_SIZE_1000_10000',
            id: 1000
        }, {
            title: 'GLOBAL_SETTINGS_PARAMETERS_ORG_SIZE_MORE_10000',
            id: 10000
        }
    ];

    public totalCollection: any[] = [
        {
            title: 'GLOBAL_SETTINGS_PARAMETERS_TOTAL_SIZE_1',
            id: 1
        }, {
            title: 'GLOBAL_SETTINGS_PARAMETERS_TOTAL_SIZE_2',
            id: 2
        }, {
            title: 'GLOBAL_SETTINGS_PARAMETERS_TOTAL_SIZE_3',
            id: 3
        }, {
            title: 'GLOBAL_SETTINGS_PARAMETERS_TOTAL_SIZE_4',
            id: 4
        }, {
            title: 'GLOBAL_SETTINGS_PARAMETERS_TOTAL_SIZE_5',
            id: 5
        }, {
            title: 'GLOBAL_SETTINGS_PARAMETERS_TOTAL_SIZE_10',
            id: 10
        }
    ];
    private transaction: pip.services.Transaction;
    private debounceCodeValidate: Function;
    private cf: Function[] = [];

    constructor(
        $rootScope: ng.IRootScopeService,
        private $state: ng.ui.IStateService,
        private iqsOrganization: iqs.shell.IOrganizationService,
        private iqsOrganizationsViewModel: iqs.shell.IOrganizationsViewModel,
        private pipTransaction: pip.services.ITransactionService,
        private iqsOrganizationsData: iqs.shell.IOrganizationsDataService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        this.transaction = pipTransaction.create('sites');
        const runWhenReady = () => {
            this.site = _.cloneDeep(this.iqsOrganizationsViewModel.getOrganizationById(this.iqsOrganization.organization.id));
            this.onChangeOrganization = this.updateOrganization;
            this.code = this.site.code;
            this.isCodeValidate = !!this.code;
            this.onPictureChanged = ($control) => {
                this.saveAvatar();
            };

            this.debounceCodeValidate = _.debounce((code: any) => {
                this.codeValidate(code);
            }, 500)
        };

        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady));
    }

    public $onDestroy() {
        this.updateOrganization();
        for (const f of this.cf) { f(); }
    }

    private updateOrganization(): void {
        if (this.isCodeValidate && !this.error) {
            this.transaction.begin('update_site');
            this.iqsOrganizationsViewModel.updateOrganization(
                this.site,
                (site: iqs.shell.Organization) => {
                    this.saveAvatar();
                    this.iqsOrganization.updateOrganization(site);
                    this.site = _.cloneDeep(site);
                },
                (err: any) => {
                    this.transaction.end(err);
                });
        } else {
            this.codeValidate(() => { this.updateOrganization(); });
        }
    }

    private saveAvatar() {
        if (this.picture) {
            this.picture.save(
                this.site.id,
                // Success callback
                () => {
                    this.transaction.end();
                },
                // Error callback
                (err: any) => {
                    console.error(err); // eslint-disable-line
                    this.transaction.end(err);
                });
        }

    }

    public onPictureCreated(obj) {
        this.picture = obj.$control;
    };

    public onResetClick() {
        this.picture.reset();
    };

    public randomName() {
        this.transaction.begin('generate_code_site');
        this.iqsOrganizationsViewModel.generateCode(
            this.site.id,
            (data: any) => {
                let keys: string[] = _.keys(data);
                this.site.code = '';
                _.each(keys, (value, $index) => {
                    if (value != '$promise' && value != '$resolved') {
                        this.site.code += data[$index];
                    }
                })
                this.error = null;
                this.code = this.site.code;
                this.isCodeValidate = true;
                this.updateOrganization();
                this.transaction.end();
            },
            (error: any) => {
                this.transaction.end(error);
            }
        );
    }

    private codeValidate(callback?: () => void): void {
        this.iqsOrganizationsData.validateCode(
            this.code,
            (data: string) => {
                if (!this.code) {
                    this.isCodeValidate = false;
                    this.error = 'ORGANIZATION_CODE_REQUITED_ERROR';

                    return;
                }
                if (data && data != this.site.id) {
                    this.isCodeValidate = false;
                    this.error = 'ORGANIZATION_CODE_FOUND_ERROR';
                } else {
                    this.isCodeValidate = true;
                    this.site.code = this.code;
                    this.error = null;
                    if (callback) callback();
                }
            },
            (error: any) => {

            }
        );
    }

    public onCodeChange(callback?: () => void): void {
        if (this.code == this.site.code) return;

        if (!this.code) {
            this.isCodeValidate = false;
            this.error = 'ORGANIZATION_CODE_REQUITED_ERROR';

            return;
        }
        this.isCodeValidate = false;
        this.error = null;
        this.debounceCodeValidate();
    }

}

(() => {
    function configureConfigGlobalOrgTranslations(
        pipTranslateProvider: pip.services.ITranslateProvider
    ) {
        pipTranslateProvider.translations('en', {
            GLOBAL_SETTINGS_ORG_SHORT_NAME: 'Short name',
            GLOBAL_SETTINGS_ORG_FULL_NAME: 'Full description',
            GLOBAL_SETTINGS_ORG_ADDRESS: 'Mail address',
            GLOBAL_SETTINGS_ORG_CODE: 'Organization code',
            GLOBAL_SETTINGS_ORG_CODE_HINT: "Unique code to identify the site",
            GLOBAL_SETTINGS_ORG_CODE_RANDOM: 'Generate random code',
            GLOBAL_SETTINGS_CHANGE_AVATAR: 'Change avatar'

        });

        pipTranslateProvider.translations('ru', {
            GLOBAL_SETTINGS_ORG_SHORT_NAME: 'Краткое название',
            GLOBAL_SETTINGS_ORG_FULL_NAME: 'Полное описание',
            GLOBAL_SETTINGS_ORG_ADDRESS: 'Почтовый адрес',
            GLOBAL_SETTINGS_ORG_CODE: 'Код площадки',
            GLOBAL_SETTINGS_ORG_CODE_HINT: 'Уникальный код для идентификации площадки',
            GLOBAL_SETTINGS_ORG_CODE_RANDOM: 'Новый случайный код',
            GLOBAL_SETTINGS_CHANGE_AVATAR: 'Занрузить логотип'
        });
    }

    angular
        .module('iqsGlobalSettingsOrganizationPanel', ['ValidateDirectives'])
        .config(configureConfigGlobalOrgTranslations)
        .component('iqsGlobalSettingsOrganizationPanel', {
            bindings: GlobalSettingsOrganizationPanelBindings,
            templateUrl: 'config/global_settings/organization/GlobalSettingsOrganizationPanel.html',
            controller: GlobalSettingsOrganizationPanelController,
            controllerAs: '$ctrl'
        })

})();
