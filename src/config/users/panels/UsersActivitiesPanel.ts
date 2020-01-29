import { IActivityFormatService } from './IUserActivityFormat';

interface IConfigUserActivitiesPanelBindings {
    [key: string]: any;
    account: any;
    edit: any;
    isPreLoading: any;
}

const ConfigUserActivitiesPanelBindings: IConfigUserActivitiesPanelBindings = {
    account: '<iqsUser',
    edit: '=iqsEdit',
    change: '=iqsChange',
    isPreLoading: '<?iqsPreLoading'
}

class ConfigUserActivitiesPanelChanges implements ng.IOnChangesObject, IConfigUserActivitiesPanelBindings {
    [key: string]: ng.IChangesObject<any>;
    account: ng.IChangesObject<iqs.shell.Account>;
    edit: ng.IChangesObject<boolean>;
    change: ng.IChangesObject<() => void>;
    isPreLoading: ng.IChangesObject<boolean>;
}

class LocalActivity {
    activityString: any
    time: Date
    icon: string
    party_name: string
}

export class RecentActivitiesIconMap {
    public 'account created': string = 'person-star';
    public 'signin': string = 'enter';
    public 'signout': string = 'exit';
    public 'password changed': string = 'key';
    public 'password recovered': string = 'key-reset';
    public 'email verified': string = 'message-check';
    public 'settings changed': string = 'config';
    public 'partnered': string = 'person-plus';
    public 'teamed up': string = 'people-plus';
    public 'followed': string = 'search-person';
    public 'disconnected': string = 'person-minus';
    public 'created': string = 'star-1';
    public 'deleted': string = 'trash';
    public 'accepted': string = 'plus';
    public 'rejected': string = 'minus';
    public 'joined': string = 'handshake';
    public 'completed': string = 'check';
    public 'canceled': string = 'cross';
    public 'progress': string = 'progress';
    public 'buzzed': string = 'forward-all';
    public 'commented': string = 'more';
    public 'cheered': string = 'cheer';
    public 'account changed': string = 'config';
}

class ConfigUserActivitiesPanelController implements ng.IController {
    public $onInit() { }

    public change: () => void;
    public activities: LocalActivity[];
    public account: iqs.shell.Account;
    public picture: any;
    public edit: string;
    public state: string;
    public transaction: pip.services.Transaction;
    public message: string;
    public activityId: string;
    public iconMap: RecentActivitiesIconMap = new RecentActivitiesIconMap();
    public isPreLoading: boolean;
    private cf: Function[] = [];

    constructor(
        pipTransaction: pip.services.ITransactionService,
        private $state: ng.ui.IStateService,

        private pipIdentity: pip.services.IIdentityService,
        private $rootScope: ng.IRootScopeService,
        private iqsOrganization: iqs.shell.IOrganizationService,
        private $location: ng.ILocationService,
        private iqsActivitiesData: iqs.shell.IActivitiesDataService,
        private iqsAccountsViewModel: iqs.shell.IAccountsViewModel,
        private $element,
        private iqsActivityFormat: IActivityFormatService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        const runWhenReady = () => {
            this.account = _.cloneDeep(this.account);
            this.activityId = this.pipIdentity.identity.user_id == this.account.id ? this.pipIdentity.identity.id : null;
            this.transaction = pipTransaction.create('settings.activities');
        };

        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    public $onChanges(changes: ConfigUserActivitiesPanelChanges) {
        if (changes.account) {
            this.account = _.cloneDeep(changes.account.currentValue);
            if (!this.account) this.account = new iqs.shell.Account();
            this.readActivities();

        }
    }

    private readActivities() {
        this.state = iqs.shell.States.Progress;
        this.$element.addClass('h-stretch layout-column layout-align-center-center');
        this.iqsActivitiesData.readActivities(this.account.id, {}, (data) => { // , active: true
            this.activities = [];
            _.each(data.data, (item: iqs.shell.Activity) => {
                this.activities.push({
                    activityString: this.iqsActivityFormat.formatActivity(item),
                    time: item.time,
                    icon: this.iconMap[item.type],
                    party_name: item.party ? item.party.name : null
                });
            })

            this.state = this.activities.length > 0 ? iqs.shell.States.Data : iqs.shell.States.Empty;
            if (this.state == iqs.shell.States.Data) {
                this.$element.removeClass('h-stretch layout-column layout-align-center-center');
            }
        })

    }

}

(() => {
    angular
        .module('iqsConfigUserActivitiesPanel', ['iqsActivities.Data', 'iqsActivityFormat'])
        .component('iqsUserActivitiesPanel', {
            bindings: ConfigUserActivitiesPanelBindings,
            templateUrl: 'config/users/panels/UsersActivitiesPanel.html',
            controller: ConfigUserActivitiesPanelController,
            controllerAs: '$ctrl'
        })
})();
