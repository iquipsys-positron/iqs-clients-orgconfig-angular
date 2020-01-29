interface IConfigUserSessionsPanelBindings {
    [key: string]: any;
    account: any;
    edit: any;
}

const ConfigUserSessionsPanelBindings: IConfigUserSessionsPanelBindings = {
    account: '<iqsUser',
    edit: '=iqsEdit',
    change: '=iqsChange'
}

class ConfigUserSessionsPanelChanges implements ng.IOnChangesObject, IConfigUserSessionsPanelBindings {
    [key: string]: ng.IChangesObject<any>;
    account: ng.IChangesObject<iqs.shell.Account>;
    edit: ng.IChangesObject<boolean>;
    change: ng.IChangesObject<() => void>;
}

class ConfigUserSessionsPanelController implements ng.IController {
    public $onInit() { }

    public change: () => void;
    public sessions: iqs.shell.Session[];
    public account: iqs.shell.Account;
    public picture: any;
    public edit: string;
    public state: string;
    public transaction: pip.services.Transaction;
    public message: string;
    public sessionId: string;
    public accessConfig: any;

    constructor(
        pipTransaction: pip.services.ITransactionService,
        private $state: ng.ui.IStateService,
        private pipIdentity: pip.services.IIdentityService,
        private $rootScope: ng.IRootScopeService,
        private iqsOrganization: iqs.shell.IOrganizationService,
        private $location: ng.ILocationService,
        private iqsSessionsData: iqs.shell.ISessionsDataService,
        private iqsAccountsViewModel: iqs.shell.IAccountsViewModel,
        private iqsAccessConfig: iqs.shell.IAccessConfigService,
        private $element,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        this.accessConfig = iqsAccessConfig.getStateConfigure().access;
        this.transaction = pipTransaction.create('settings.sessions');
        const runWhenReady = () => {
            this.account = _.cloneDeep(this.account);
            this.sessionId = this.pipIdentity.identity.user_id == this.account.id ? this.pipIdentity.identity.id : null;
        };
        if (this.iqsLoading.isDone) { runWhenReady(); }
        $rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady);
    }

    public $onChanges(changes: ConfigUserSessionsPanelChanges) {
        if (changes.account) {
            this.account = _.cloneDeep(changes.account.currentValue);
            if (!this.account) this.account = new iqs.shell.Account();
            this.readSessions();

        }
    }

    public onRemoveAll() {
        const tid = this.transaction.begin('REMOVING');

        async.eachSeries(
            this.sessions,
            (session: any, callback) => {
                if (session.id == this.sessionId) {
                    callback();
                } else {
                    this.iqsSessionsData.deleteSession(
                        {
                            session_id: session.id
                        },
                        () => {
                            this.sessions = _.without(this.sessions, session);
                            callback();
                        },
                        (error) => {
                            callback;
                        }
                    );
                }
            },
            (err) => {
                if (err) {
                    this.transaction.end(err);
                }
                if (this.transaction.aborted(tid)) {
                    return;
                }
                this.transaction.end();
            });
    }

    /**
     * @ngdoc method
     * @methodOf pipUserSettings.Sessions:pipUserSettingsSessionsController
     * @name pipUserSettings.Sessions.pipUserSettingsSessionsController:onRemove
     *
     * @description
     * Closes passed session.
     *
     * @param {Object} session  Session configuration object
     */
    public onRemove(session: iqs.shell.Session, callback) {
        if (session.id === this.sessionId) {
            return;
        }
        const tid = this.transaction.begin('REMOVING');
        this.iqsSessionsData.deleteSession(
            {
                session_id: session.id
            },
            () => {
                if (this.transaction.aborted(tid)) {
                    return;
                }
                this.transaction.end();

                this.sessions = _.without(this.sessions, session);
                if (callback) {
                    callback();
                }
            },
            (error) => {
                this.transaction.end(error);
                this.message = 'ERROR_' + error.status || error.data.status_code;
            }
        );
    }

    private readSessions() {
        this.state = iqs.shell.States.Progress;
        this.$element.addClass('h-stretch layout-column layout-align-center-center');
        this.iqsSessionsData.readSessions({ user_id: this.account.id }, (data) => { // , active: true
            this.sessions = data.data;
            this.state = this.sessions.length > 0 ? iqs.shell.States.Data : iqs.shell.States.Empty;
            if (this.state == iqs.shell.States.Data) {
                this.$element.removeClass('h-stretch layout-column layout-align-center-center');
            }
        })

    }

}

(() => {
    angular
        .module('iqsConfigUserSessionsPanel', [])
        .component('iqsUserSessionsPanel', {
            bindings: ConfigUserSessionsPanelBindings,
            templateUrl: 'config/users/panels/UsersSessionsPanel.html',
            controller: ConfigUserSessionsPanelController,
            controllerAs: '$ctrl'
        })
})();
