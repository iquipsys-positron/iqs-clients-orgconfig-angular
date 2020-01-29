interface IConfigUserEditPanelBindings {
    [key: string]: any;
    account: any;
    edit: any;
}

const ConfigUserEditPanelBindings: IConfigUserEditPanelBindings = {
    account: '<iqsUser',
    edit: '=iqsEdit',
    change: '=iqsChange'
}

class ConfigUserEditPanelChanges implements ng.IOnChangesObject, IConfigUserEditPanelBindings {
    [key: string]: ng.IChangesObject<any>;
    account: ng.IChangesObject<iqs.shell.Account>;
    edit: ng.IChangesObject<boolean>;
    change: ng.IChangesObject<(item) => void>;
}

class ConfigUserEditPanelController implements ng.IController {
    public $onInit() { }

    public change: (item) => void;
    public account: iqs.shell.Account;
    public picture: any;
    public edit: string;
    public transaction: pip.services.Transaction;
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
    ]
    public accessConfig: any;
    private cf: Function[] = [];

    constructor(
        private $state: ng.ui.IStateService,
        private $rootScope: any,
        private iqsOrganization: iqs.shell.IOrganizationService,
        private $location: ng.ILocationService,
        private pipTransaction: pip.services.ITransactionService,
        private iqsAccountsViewModel: iqs.shell.IAccountsViewModel,
        private iqsRolesData: iqs.shell.IRolesDataService,
        private iqsAccessConfig: iqs.shell.IAccessConfigService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        const runWhenReady = () => {
            this.accessConfig = iqsAccessConfig.getStateConfigure().access;
            this.account = _.cloneDeep(this.account);
        };
        this.transaction = pipTransaction.create('Accounts');
        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, () => { runWhenReady(); }));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    public filterTypeCollection() {

    }

    public $onChanges(changes: ConfigUserEditPanelChanges) {
        if (changes.account) {
            this.account = _.cloneDeep(changes.account.currentValue);
            if (!this.account) this.account = new iqs.shell.Account();
            this.account['role'] = this.account['localRole'] || 'user';
            this.filterTypeCollection();
        }
    }

    public cancelClick() {
        this.edit = 'data';
        this.$location.search('edit', 'data');
        if (this.change) {
            this.change(null);
        }
    }

    public saveClick() {
        if (!this.accessConfig.addUser) return;

        let roles = _.filter(this.account.roles, (role: string) => {
            return role.indexOf(this.iqsOrganization.orgId) == 0;
        });

        let newRole: string = this.account['role'];

        if (roles && roles.length > 0) {
            this.transaction.begin('Roles');
            async.each(roles,
                (userRole: string, callback) => {
                    let r: string[] = userRole.split(':');
                    let role: string = r && r[1] ? r[1] : null;
                    if (role) {
                        this.iqsRolesData.deleteRole(
                            {
                                user_id: this.account.id,
                                org_id: this.iqsOrganization.orgId,
                                role: role
                            },
                            (data: any) => {
                                callback();
                            },
                            (error: any) => {
                                callback(error)
                            });
                    } else {
                        callback();
                    }
                },
                (error: any) => {
                    if (error) {
                        this.transaction.end(error);
                    } else {
                        this.iqsRolesData.createRole(
                            {
                                user_id: this.account.id,
                                org_id: this.iqsOrganization.orgId
                            },
                            newRole,
                            (data: string[]) => {
                                this.account.roles = data;
                                this.account['localRole'] = this.account['role'];
                                this.transaction.end();
                                this.$location.search('user_id', this.account.id);
                                if (this.change) {
                                    this.change(this.account);
                                }
                                this.edit = 'data';
                                this.$location.search('edit', 'data');

                            },
                            (error: any) => {
                                this.transaction.end(error);
                            });
                    }
                });
        }

    }

}

(() => {
    angular
        .module('iqsConfigUserEditPanel', [])
        .component('iqsUserEditPanel', {
            bindings: ConfigUserEditPanelBindings,
            templateUrl: 'config/users/panels/UsersEditPanel.html',
            controller: ConfigUserEditPanelController,
            controllerAs: '$ctrl'
        })
})();
