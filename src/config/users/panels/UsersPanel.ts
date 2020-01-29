interface IConfigUsersPanelBindings {
    [key: string]: any;
}

const ConfigUsersPanelBindings: IConfigUsersPanelBindings = {}

class ConfigUsersPanelChanges implements ng.IOnChangesObject, IConfigUsersPanelBindings {
    [key: string]: ng.IChangesObject<any>;
}

class ConfigUserStatues {
    title: string;
    id: string;
}

class ConfigUserTabs {
    title: string;
    id: number;
}

class ConfigUsersPanelController implements ng.IController {
    public $onInit() { }

    public users: any[] = [];
    public details: boolean = false;
    public status: string = '';
    public edit: string;
    public accessConfig: any;
    public currentStateFunc: (item) => void;
    public currentStateEditFunc: (item) => void;
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
    public sections = [
        {
            title: 'INFORMATION',
            id: 0
        },
        {
            title: 'SESSIONS',
            id: 1
        }, {
            title: 'ACTIONS',
            id: 2
        }
    ];
    public section: number = 0;
    public selectType: string;
    public selectedIndex: number = 0;

    public allItems: any[] = [];
    public transaction: pip.services.Transaction;
    public ownerUserId: string;
    public isPreLoading: boolean = true;
    private cf: Function[] = [];

    constructor(
        $scope,
        private $location: ng.ILocationService,
        private $state: ng.ui.IStateService,
        private $timeout: ng.ITimeoutService,
        private iqsAccountsViewModel: iqs.shell.IAccountsViewModel,
        private iqsInvitationsViewModel: iqs.shell.IInvitationsViewModel,
        private iqsRolesData: iqs.shell.IRolesDataService,
        private pipTransaction: pip.services.ITransactionService,
        private iqsOrganization: iqs.shell.IOrganizationService,
        private pipIdentity: pip.services.IIdentityService,
        public pipMedia: pip.layouts.IMediaService,
        private pipTranslate: pip.services.ITranslateService,
        private pipConfirmationDialog: pip.dialogs.IConfirmationDialogService,
        private $rootScope: ng.IRootScopeService,
        private iqsAccessConfig: iqs.shell.IAccessConfigService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        this.transaction = pipTransaction.create('Accounts');
        this.currentStateFunc = (item) => {
            if (item) {

                let index: number = _.findIndex(this.users, { id: item.id });

                if (index == -1) {
                    this.users.push(item);
                } else {
                    this.users[index] = item;
                }
                this.$location.search('user_id', item.id);
                this.sortUsers();
                $timeout(() => {
                    this.selectItem();
                }, 0);
            }
            if (!this.pipMedia('gt-sm')) {
                if (this.$location.search()['edit'] == 'edit' || this.$location.search()['edit'] == 'add') {
                    this.details = true;
                    this.$location.search('details', 'details');
                } else {
                    this.details = false;
                    this.$location.search('details', 'main');
                }
                this.$rootScope.$broadcast('iqsChangeNav');
            }
        }

        this.currentStateEditFunc = (item) => {
            if (item) {
                let index: number = _.findIndex(this.users, { id: item.id });

                if (index == -1) {
                    this.users.push(item);
                } else {
                    this.users[index] = item;
                }
                this.$location.search('user_id', item.id);
                this.sortUsers();
                $timeout(() => {
                    this.selectItem();
                    this.accessConfig = iqsAccessConfig.getStateConfigure().access;
                }, 0);
            }
            if (!this.pipMedia('gt-sm')) {
                if (this.$location.search()['edit'] == 'edit' || this.$location.search()['edit'] == 'add') {
                    this.details = true;
                    this.$location.search('details', 'details');
                } else {
                    this.details = false;
                    this.$location.search('details', 'main');
                }
                this.$rootScope.$broadcast('iqsChangeNav');
            }
        }

        if (this.edit == 'add') {
            this.iqsAccountsViewModel.selectedIndex = null;
        }

        if (!this.pipMedia('gt-sm')) {
            this.details = $location.search().details == 'details' ? true : false;
        } else {
            this.details = false;
            this.$location.search('details', 'main');
        }

        this.cf.push($rootScope.$on('pipMainResized', () => {
            if (!this.pipMedia('gt-sm')) {
            } else {
                this.details = false;
                this.$location.search('details', 'main');
                this.$rootScope.$broadcast('iqsChangeNav');
            }
        }));
        this.cf.push($rootScope.$on('iqsChangeNavPage', () => {
            if (!this.pipMedia('gt-sm')) {
                this.details = $location.search().details == 'details' ? true : false;
                this.edit = $location.search().edit || 'data';
            }
        }));
        const runWhenReady = () => {
            this.accessConfig = iqsAccessConfig.getStateConfigure().access;
            this.config();
            this.init();
            this.isPreLoading = false;
        };

        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    private sortUsers() {
        this.users = _.sortBy(this.users, (item: any) => {
            let name: string = item.name ? item.name : item.invitee_name ? item.invitee_name : item.invitee_email;
            return item.localType + name.toLocaleLowerCase();
        });
    }

    public init() {
        this.ownerUserId = this.pipIdentity.identity.user_id;

        let readInvites: boolean = false, readAccounts: boolean = false;
        this.transaction.begin('Init');
        this.users.length = 0;
        this.iqsInvitationsViewModel.initInvitations(
            'all',
            (data) => {
                data.forEach(element => {
                    element['localType'] = 'invite';
                    element['role'] = element['role'] || iqs.shell.AccessRole.roles[iqs.shell.AccessRole.user];
                    this.users.push(element);

                });
                readInvites = true;

                this.iqsAccountsViewModel.initAccounts('all',
                    (data) => {
                        data.forEach(element => {
                            element['localType'] = 'user';
                            this.users.push(element);
                        });
                        this.sortUsers();
                        readAccounts = true;
                        this.allItems = this.users;
                        this.onSearchResult(this.status);
                        this.selectUser();
                        this.transaction.end();
                    },
                    (error: any) => {
                        this.transaction.end(error);
                    });
            },
            (error: any) => {
                this.transaction.end(error);
            });
    }

    public onSearchResult(query: string) {
        this.status = query;

    }

    public onCanselSearch() {
        this.status = null;
        this.selectButtons(null);
    }

    private selectUser(index?: number) {
        if (index === undefined || index === null || index < 0 || index > this.users.length - 1) {
            let id: string = this.$location.search()['user_id'];
            if (id) {
                index = _.findIndex(this.users, (item: any) => {
                    return item.id == id;
                });
            }
            if (!index || index == -1) {
                index = 0;
            }
        }

        this.selectedIndex = index;
        this.$location.search('user_id', this.users[index].id);
    }

    public selectButtons(data) {
        this.$location.search('type', this.status);
        if (data) {
            this.iqsAccountsViewModel.filterWithArrayObjects(data);
        } else {
            this.iqsAccountsViewModel.filterAccounts('all');
        }
    }

    public config() {
        this.edit = 'data';
        this.$location.search('edit', this.edit);
    }

    public state() {
        if (this.iqsAccountsViewModel.state == iqs.shell.States.Data || this.iqsInvitationsViewModel.state == iqs.shell.States.Data)
            return iqs.shell.States.Data;
        if (this.iqsAccountsViewModel.state == iqs.shell.States.Progress && this.iqsInvitationsViewModel.state == iqs.shell.States.Progress)
            return iqs.shell.States.Progress;
        if (this.iqsAccountsViewModel.state == iqs.shell.States.Empty && this.iqsInvitationsViewModel.state == iqs.shell.States.Empty)
            return iqs.shell.States.Empty;

        return this.iqsAccountsViewModel.state;
    }

    public selectItem(index?: number) {
        if (this.edit == 'add' || this.edit == 'edit') return;

        if (index === null || index === undefined || index === -1 || index > this.users.length) {
            let id = this.$location.search()['user_id'];
            if (id) {
                index = _.findIndex(this.users, { id: id });
                if (index == -1) {
                    index = 0
                }
            } else {
                index = 0;
            }
        }
        this.selectedIndex = index;
        this.$location.search('user_id', this.users[index].id);
        this.section = 0;

        if (!this.pipMedia('gt-sm')) {
            this.details = true;
            this.$location.search('details', 'details');
            this.$rootScope.$broadcast('iqsChangeNav');
        }
    }


    public selectSection(id: string) {
        this.$location.search('section', this.section);
    }

    public singleContent() {
        this.details = !this.details;
    }

    public changeEdit() {
        this.edit = 'edit';
        this.$location.search('edit', 'edit');
        this.$location.search('details', 'edit');
        if (!this.pipMedia('gt-sm')) {
            this.details = true;
        }
        this.$rootScope.$broadcast('iqsChangeNav');
    }

    public addClick() {
        //this.iqsDevicesViewModel.selectedIndex = null;
        this.edit = 'add';
        this.$location.search('edit', 'add');
        this.$location.search('details', 'add');
        this.$rootScope.$broadcast('iqsChangeNav');
    }

    public delete(id: string) {
        let configParams: pip.dialogs.ConfirmationDialogParams = {}, roles: string[];
        configParams.title = this.pipTranslate.translate('DELETE_ROLE');// + this.collection[this.selectedIndex()].name + '?';
        configParams.ok = 'DELETE';
        configParams.cancel = 'CANCEL';

        this.pipConfirmationDialog.show(configParams, () => {
            roles = _.cloneDeep(this.users[this.selectedIndex].roles);

            roles = [this.iqsOrganization.orgId + ':' + this.users[this.selectedIndex].localRole];
            this.transaction.begin('deleteRole');
            this.iqsRolesData.deleteRole(
                {
                    user_id: this.users[this.selectedIndex].id
                },
                (data: string[]) => {
                    this.users = _.without(this.users, this.users[this.selectedIndex]);
                    if (this.selectedIndex > this.users.length - 1) {
                        this.selectedIndex = this.users.length - 1;
                    }
                    this.transaction.end();
                },
                (error: any) => {
                    this.transaction.end(error);
                });
        });
    }

    public deleteInvite(id: string) {
        let configParams: pip.dialogs.ConfirmationDialogParams = {};
        configParams.title = this.pipTranslate.translate('DELETE_INVITE');// + this.collection[this.selectedIndex()].name + '?';
        configParams.ok = 'DELETE';
        configParams.cancel = 'CANCEL';

        this.pipConfirmationDialog.show(configParams, () => {
            this.transaction.begin('deleteInvitation');
            this.iqsInvitationsViewModel.deleteInvitation(
                id,
                () => {
                    this.users = _.without(this.users, this.users[this.selectedIndex]);
                    if (this.selectedIndex > this.users.length) {
                        this.selectedIndex = this.users.length - 1;
                    }
                    this.transaction.end();
                },
                (error: any) => {
                    this.transaction.end(error);
                });
        })
    }


    public resendInvite(index: number) {
        this.users[index].sent_time = new Date();
        this.transaction.begin('resendInvite');
        this.iqsInvitationsViewModel.resendInvite(
            this.users[index],
            (data) => {
                let item = data;
                item['localType'] = 'invite';
                item['localRole'] = this.users[index]['localRole'];
                this.users[index] = item;
                this.transaction.end();
            },
            (error: any) => {
                this.transaction.end(error);
            });
    }

    public activateInvite(index: number) {
        this.users[index].invitation_id = this.users[index].id;
        this.transaction.begin('approveInvite');
        this.iqsInvitationsViewModel.approveInvite(
            this.users[index],
            (data) => {
                this.iqsAccountsViewModel.initAccounts(
                    'all',
                    (items) => {
                        let item = _.find(items, { login: data.invitee_email });
                        if (item) {
                            item['localType'] = 'user';

                            let roles: string[] = item.roles
                            let roleIndex: number = _.findIndex(roles, (r: string) => {
                                return r.indexOf(this.iqsOrganization.orgId) == 0;
                            });
                            let role: string;
                            if (roleIndex > -1) {
                                role = roles[roleIndex].substring(this.iqsOrganization.orgId.length + 1);
                            } else {
                                role = 'user';
                            }
                            item['localRole'] = role;
                            this.users[index] = item;
                            this.sortUsers();

                        }
                        this.transaction.end();
                    },
                    (error: any) => {
                        this.transaction.end(error);
                    });
            },
            (error: any) => {
                this.transaction.end(error);
            });
    }

    public denyInvite(id: string) {
        this.transaction.begin('respondInvite');
        this.iqsInvitationsViewModel.denyInvite(
            {
                id: id
            },
            (data) => {
                this.users = _.without(this.users, this.users[this.selectedIndex]);
                if (this.selectedIndex > this.users.length) {
                    this.selectedIndex = this.users.length - 1;
                }
                this.transaction.end();
            },
            (error: any) => {
                this.transaction.end(error);
            });
    }


}

(() => {

    angular
        .module('iqsConfigUsersPanel', ['iqsAccounts.ViewModel', 'iqsConfigUserEditPanel', 'iqsConfigUserInvitePanel', 'iqsConfigUserActivitiesPanel'])
        .component('iqsUsersPanel', {
            bindings: ConfigUsersPanelBindings,
            templateUrl: 'config/users/panels/UsersPanel.html',
            controller: ConfigUsersPanelController,
            controllerAs: '$ctrl'
        })
})();
