interface IConfigUserInvitePanelBindings {
    [key: string]: any;

    change: any;
    edit: any;
}

const ConfigUserInvitePanelBindings: IConfigUserInvitePanelBindings = {
    edit: '=iqsEdit',
    change: '=iqsChange'
}

class ConfigUserInvitePanelChanges implements ng.IOnChangesObject, IConfigUserInvitePanelBindings {
    [key: string]: ng.IChangesObject<any>;

    edit: ng.IChangesObject<boolean>;
    change: ng.IChangesObject<(item) => void>;
}

class ConfigUserInvitePanelController implements ng.IController {
    public $onInit() { }

    public change: (item) => void;
    public account: iqs.shell.Account;
    public newAccount: iqs.shell.Account;
    public searchText: string = '';

    public picture: any;
    public edit: string;
    public accounts: iqs.shell.Account[] = [];
    public userAccounts: iqs.shell.Account[] = [];

    public role: string = 'admin';
    public transaction: pip.services.Transaction;
    public accessConfig: any;
    public roleItems = [
        {
            title: 'admin',
            subtitle: 'ADMIN_SUBTITLE'
        },
        {
            title: 'manager',
            subtitle: 'MANAGER_SUBTITLE'
        },
        {
            title: 'user',
            subtitle: 'USER_SUBTITLE'
        }
    ];
    private cf: Function[] = [];

    constructor(
        private $state: ng.ui.IStateService,
        private $rootScope: ng.IRootScopeService,
        private $q: ng.IQService,
        private pipTransaction: pip.services.ITransactionService,
        private pipIdentity: pip.services.IIdentityService,
        private iqsOrganization: iqs.shell.IOrganizationService,
        private $location: ng.ILocationService,
        private iqsInvitationsViewModel: iqs.shell.IInvitationsViewModel,
        private iqsAccountsData: iqs.shell.IAccountsDataService,
        private pipToasts: pip.controls.IToastService,
        private pipTranslate: pip.services.ITranslateService,
        private iqsRolesData: iqs.shell.IRolesDataService,
        private iqsAccountsViewModel: iqs.shell.IAccountsViewModel,
        private iqsValidatorsService: iqs.shell.IValidatorsService,
        private iqsAccessConfig: iqs.shell.IAccessConfigService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {

        this.transaction = pipTransaction.create('Invites');
        
        const runWhenReady = () => {
            this.accessConfig = iqsAccessConfig.getStateConfigure().access;
            this.iqsAccountsData.readAccounts(
                {},
                (data: iqs.shell.DataPage<iqs.shell.Account>) => {
                    this.userAccounts = data.data;
                },
                (error: any) => {
                    // todo error
                });
        };

        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    public changePerson() {

    }

    public cancelClick() {
        this.edit = 'data';
        this.$location.search('edit', 'data');
        if (this.change) {
            this.change(null);
        }
    }

    public querySearch(query: string) {
        var deferred = this.$q.defer();
        if (!query || query.length < 3) {

            return [];
        }
        query = query.toLocaleLowerCase();

        this.iqsAccountsViewModel.getAccountsAll(
            { search: query },
            (data: iqs.shell.Account[]) => {

                // save last accounts result
                if (data && data.length) {
                    this.accounts = data;
                }

                deferred.resolve(data)
            },
            (error: any) => { }
        );

        return deferred.promise;
    }

    public getPeopleValidate(): boolean {
        return this.getPeopleEmailValidate() && this.getPeopleUniqueValidate();
    }

    public getPeopleEmailValidate(): boolean {
        let validate: string = this.account && this.account.login ? this.account.login : this.searchText;
        if (!validate) return true;

        return this.iqsValidatorsService.validateEmail(validate);
    }

    public getPeopleUniqueValidate(): boolean {
        let validate: string = this.account && this.account.login ? this.account.login : this.searchText;
        if (!validate) return true;

        validate = validate.toLocaleLowerCase();

        let index = _.findIndex(this.userAccounts, (item: iqs.shell.Account) => {
            return item.login && validate == item.login.toLocaleLowerCase();
        });

        return index == -1;
    }

    public onItemChange(): void {
        if (this.account && this.account.id) {

            return;
        }

        if (!this.searchText) {
            return;
        }

        let query: string = this.searchText.toLocaleLowerCase();
        let i: number = _.findIndex(this.accounts, (item: iqs.shell.Account) => {
            let isLogin: boolean = item.login && item.login.toLocaleLowerCase() == this.searchText;
            let isName: boolean = item.name && item.name.toLocaleLowerCase() == this.searchText;

            return isLogin || isName;
        });

        if (i != -1) {
            this.account = _.cloneDeep(this.accounts[i]);
        } else {
            this.addPeople();
        }
    }

    public onKeyDown($event) {
        // if press Enter
        if ($event && $event.keyCode == 13) {
            this.addPeople();
        }
    }

    public getItemText(item: iqs.shell.Account): string {
        if (item.login && item.name) {
            return item.name + ' (' + item.login + ')';
        } else {
            return item.name || item.login;
        }
    }

    public accountIsEmpty(): boolean {
        let validate: string = this.account && this.account.login ? this.account.login : this.searchText;

        return !validate;
    }

    public addPeople() {
        let account: Account;
        if ((!this.account || !this.account.id) && this.getPeopleValidate()) {
            if (this.searchText) {
                this.account = new iqs.shell.Account();
                this.account.login = this.searchText;
                this.searchText = null;
            }
        }
    }

    public saveClick() {
        if (!this.accessConfig.addUser) return;

        if (!this.account || !this.account.login) {
            this.addPeople()
        }
        if (!this.account || !this.account.login) return;


        let invitation: iqs.shell.Invitation = new iqs.shell.Invitation();
        invitation = new iqs.shell.Invitation();
        invitation.creator_id = this.pipIdentity.identity.user.id;
        invitation.creator_name = this.pipIdentity.identity.user.name;
        invitation.invitee_email = this.account.login;
        invitation.org_id = this.iqsOrganization.orgId;
        invitation.language = this.pipIdentity.identity.user.language;
        invitation.organization_name = this.iqsOrganization.organization.name;
        invitation.role = this.role;
        invitation.action = iqs.shell.InvitationAction.Activate;

        this.transaction.begin('Roles');

        if (this.account && this.account.id) {
            let role = this.role;
            this.iqsRolesData.createRole(
                {
                    user_id: this.account.id,
                    org_id: this.iqsOrganization.orgId
                },
                role,
                (data: string[]) => {
                    this.account.roles = data;

                    // todo: set from readed roles
                    this.account['localType'] = 'user'; // user or invite
                    this.account['localRole'] = this.role;
                    this.$location.search('user_id', this.account.id);
                    if (this.change) {
                        this.change(this.account);
                    }
                    invitation.action = iqs.shell.InvitationAction.Notify;
                    this.iqsInvitationsViewModel.sendNotifyMessage(invitation,
                        (data) => {

                        },
                        (error: any) => {

                        })

                    this.edit = 'data';
                    this.$location.search('edit', 'data');
                    this.transaction.end();
                },
                (error: any) => {
                    this.transaction.end(error);
                });

        } else {
            if (this.account && this.account.login) {
                this.iqsInvitationsViewModel.saveInvitation(
                    invitation,
                    (data) => {
                        data['localType'] = 'invite'; // user or invite
                        if (this.change) {
                            this.change(data);
                        }
                        this.transaction.end();
                        this.edit = 'data';
                        this.$location.search('edit', 'data');
                    },
                    (error: any) => {
                        // todo error
                        this.transaction.end(error);
                    });
            }
        }
    }
}

(() => {
    angular
        .module('iqsConfigUserInvitePanel', [])
        .component('iqsUserInvitePanel', {
            bindings: ConfigUserInvitePanelBindings,
            templateUrl: 'config/users/panels/UsersInvitePanel.html',
            controller: ConfigUserInvitePanelController,
            controllerAs: '$ctrl'
        })
})();
