interface IGlobalSettingsPaymentsPanelBindings {
    [key: string]: any;
}

const GlobalSettingsPaymentsPanelBindings: IGlobalSettingsPaymentsPanelBindings = {}

class GlobalSettingsPaymentsPanelChanges implements ng.IOnChangesObject, IGlobalSettingsPaymentsPanelBindings {
    [key: string]: ng.IChangesObject<any>;
}


class GlobalSettingsPaymentsPanelController implements ng.IController {
    public $onInit() { }
    public card: iqs.shell.CreditCard;

    public hasCard: boolean;
    private creditCardPanelApi: any;
    private cf: Function[] = [];

    constructor(
        $rootScope: ng.IRootScopeService,
        private iqsCreditCardsData: iqs.shell.ICreditCardsDataService,
        private iqsCreditCardsViewModel: iqs.shell.ICreditCardsViewModel,
        private pipTranslate: pip.services.ITranslateService,
        private pipToasts: pip.controls.IToastService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";
        const runWhenReady = () => {
            this.hasCard = false;
            this.card = new iqs.shell.CreditCard();
            this.iqsCreditCardsViewModel.reload((cards: iqs.shell.CreditCard[]) => {
                if (Array.isArray(cards) && cards.length) {
                    this.card = cards[0];
                    this.hasCard = true;
                }
            });
        };

        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    public get transaction(): pip.services.Transaction {
        return this.iqsCreditCardsViewModel.getTransaction();
    }

    public creditCardPanelInit(api) {
        this.creditCardPanelApi = api;
    }

    public savePayment(): void {
        if (this.creditCardPanelApi && typeof this.creditCardPanelApi.save === 'function') this.creditCardPanelApi.save();
    }

    public onSaveCreditCard(card: iqs.shell.CreditCard) {
        const onSuccess = (data: iqs.shell.CreditCard) => {
            this.card = data;
            this.pipToasts.showMessage(this.pipTranslate.translate('GLOBAL_SETTINGS_PAYMENTS_SAVE_SUCCESS'), null, null);
        };
        const onError = (error: any) => {
            this.pipToasts.showError(this.pipTranslate.translate('GLOBAL_SETTINGS_PAYMENTS_SAVE_ERROR'),
                ['ok'], () => { }, null, null);
        };
        if (this.hasCard) {
            this.iqsCreditCardsData.updateCreditCard(this.card.id, card, onSuccess, onError);
        } else {
            this.iqsCreditCardsData.createCreditCard(card, onSuccess, onError);
            this.hasCard = true;
        }
    }
}

(() => {
    function configureConfigGlobalPaymentsTranslations(
        pipTranslateProvider: pip.services.ITranslateProvider
    ) {
        pipTranslateProvider.translations('en', {
            GLOBAL_SETTINGS_PAYMENTS_SAVE: 'Save requisites',
            GLOBAL_SETTINGS_PAYMENTS_SAVE_SUCCESS: 'Requisites saved successfully',
            GLOBAL_SETTINGS_PAYMENTS_SAVE_ERROR: 'Error happened during saving requisites'
        });

        pipTranslateProvider.translations('ru', {
            GLOBAL_SETTINGS_PAYMENTS_SAVE: 'Сохранить реквизиты',
            GLOBAL_SETTINGS_PAYMENTS_SAVE_SUCCESS: 'Реквизиты успешно сохранены',
            GLOBAL_SETTINGS_PAYMENTS_SAVE_ERROR: 'Во время сохраненя реквизитов произошла ошибка'
        });
    }

    angular
        .module('iqsGlobalSettingsPaymentsPanel', [
            'iqsCreditCardPanel',
            'iqsCreditCards'
        ])
        .config(configureConfigGlobalPaymentsTranslations)
        .component('iqsGlobalSettingsPaymentsPanel', {
            bindings: GlobalSettingsPaymentsPanelBindings,
            templateUrl: 'config/global_settings/payments/GlobalSettingsPaymentsPanel.html',
            controller: GlobalSettingsPaymentsPanelController,
            controllerAs: '$ctrl'
        })

})();
