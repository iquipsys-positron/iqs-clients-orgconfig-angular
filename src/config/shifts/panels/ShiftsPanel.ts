interface IConfigShiftsPanelBindings {
    [key: string]: any;
}

const ConfigShiftsPanelBindings: IConfigShiftsPanelBindings = {}

class ConfigShiftsPanelChanges implements ng.IOnChangesObject, IConfigShiftsPanelBindings {
    [key: string]: ng.IChangesObject<any>;
}

class ConfigShiftStatues {
    title: string;
    id: string;
}
class ConfigShiftTabs {
    title: string;
    id: number;
}


class ConfigShiftsPanelController implements ng.IController {
    public $onInit() { }
    private resizePromise: Function;
    private changeNavPromice: Function;
    public details: boolean = false;
    public status: string = '';
    public section: number;
    public edit: string;
    public accessConfig: any;
    public isPreLoading: boolean = true;
    private cf: Function[] = [];

    constructor(
        $scope: ng.IScope,
        private $location: ng.ILocationService,
        private iqsShiftsViewModel: iqs.shell.IShiftsViewModel,
        private $state: ng.ui.IStateService,
        public pipMedia: pip.layouts.IMediaService,
        private $rootScope: ng.IRootScopeService,
        private iqsAccessConfig: iqs.shell.IAccessConfigService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        this.edit = $location.search()['edit'] || 'data';
        if (this.$location.search()['shift_id']) {
            let index: number = _.findIndex(this.iqsShiftsViewModel.shifts, { id: this.$location.search()['shift_id'] });
            if (index != -1) {
                this.iqsShiftsViewModel.selectItem(index);
            }
        }

        if (!this.pipMedia('gt-sm')) {
            this.details = $location.search()['details'] == 'details' ? true : false;
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
            this.isPreLoading = false;
        };

        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    public get transaction(): pip.services.Transaction {
        return this.iqsShiftsViewModel.getTransaction();
    }

    public get collection() {
        return this.iqsShiftsViewModel.shifts;
    }

    public state() {
        return this.iqsShiftsViewModel.state;
    }

    public selectedIndex() {
        if (this.edit != 'add')
            return this.iqsShiftsViewModel.selectedIndex;

        return null;
    }

    public detailsClick() {
        this.details = true;
        this.$location.search('details', 'details');
        this.$rootScope.$broadcast('iqsChangeNav');
    }

    public selectItem(index: number) {
        if (this.edit == 'add' || this.edit == 'edit' || this.transaction.busy()) {
            return;
        } else {
            if (this.iqsShiftsViewModel.shifts.length > 0 && this.iqsShiftsViewModel.shifts[index]) {
                this.$location.search('shift_id', this.iqsShiftsViewModel.shifts[index].id);
            }
            this.iqsShiftsViewModel.selectedIndex = index;

            if (!this.pipMedia('gt-sm')) {
                this.detailsClick();
            }
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

        // this.$location.search('details', 'edit');
        if (!this.pipMedia('gt-sm')) {
            this.detailsClick();
        }
    }

    public addClick() {
        this.edit = 'add';
        this.$location.search('edit', 'add');

        // this.$location.search('details', 'add');
        if (!this.pipMedia('gt-sm')) {
            this.detailsClick();
        }
    }

}

(() => {
    angular
        .module('iqsConfigShiftsPanel', ['iqsConfigShiftEditPanel'])
        .component('iqsShiftsPanel', {
            bindings: ConfigShiftsPanelBindings,
            templateUrl: 'config/shifts/panels/ShiftsPanel.html',
            controller: ConfigShiftsPanelController,
            controllerAs: '$ctrl'
        })
})();
