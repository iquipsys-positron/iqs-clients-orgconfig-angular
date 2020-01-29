interface IConfigShiftEditPanelBindings {
    [key: string]: any;
    object: any;
    edit: any;
    details: any;
}

const ConfigShiftEditPanelBindings: IConfigShiftEditPanelBindings = {
    object: '<iqsShift',
    edit: '=iqsEdit',
    details: '=iqsDetails'
}

class ConfigShiftEditPanelChanges implements ng.IOnChangesObject, IConfigShiftEditPanelBindings {
    [key: string]: ng.IChangesObject<any>;
    object: ng.IChangesObject<any>;
    edit: ng.IChangesObject<boolean>;
    details: ng.IChangesObject<boolean>;
}

class ConfigShiftEditPanelController implements ng.IController {
    public $onInit() { }
    public object: iqs.shell.Shift;
    public oldObject: iqs.shell.Shift;
    public objectLocal: any;
    public edit: string;
    public picture: any;
    public timeStep: number = 60;
    public error: string;
    public details: boolean;
    public dateStart: Date = new Date(2018, 1, 1, 0, 0, 0);
    public dateEnd: Date = new Date(2018, 1, 1, 8, 0, 0);
    public onDateChange: (date: Date) => void;
    public onDateChangeEnd: (date: Date) => void;
    public form: any;
    public touchedErrorsWithHint: Function;
    public nameCollection: string[];
    public accessConfig: any;
    private cf: Function[] = [];

    constructor(
        private $state: ng.ui.IStateService,
        private $rootScope: any,
        private $scope: ng.IScope,
        private iqsOrganization: iqs.shell.IOrganizationService,
        private $location: ng.ILocationService,
        private iqsShiftsViewModel: iqs.shell.IShiftsViewModel,
        private pipFormErrors: pip.errors.IFormErrorsService,
        private pipTranslate: pip.services.ITranslateService,
        private pipMedia: pip.layouts.IMediaService,
        private pipConfirmationDialog: pip.dialogs.IConfirmationDialogService,
        private iqsAccessConfig: iqs.shell.IAccessConfigService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        const runWhenReady = () => {
            this.accessConfig = iqsAccessConfig.getStateConfigure().access;
            this.oldObject = _.cloneDeep(this.object);
            this.object = _.cloneDeep(this.object);
            this.touchedErrorsWithHint = pipFormErrors.touchedErrorsWithHint;

            this.onDateChange = (date: Date) => {
                this.dateStart = date;
            }
            this.onDateChangeEnd = (date: Date) => {
                this.dateEnd = date;
                if (date < this.dateStart)
                    this.dateEnd.setDate(this.dateEnd.getDate() + 1)
            }
        };

        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    public $postLink() {
        this.form = this.$scope.form;
    }

    public $onChanges(changes: ConfigShiftEditPanelChanges) {
        if (changes.object) {
            this.error = null;
            this.object = _.cloneDeep(changes.object.currentValue);
            if (!this.object) {
                this.object = new iqs.shell.Shift();
                this.dateStart = new Date(2018, 1, 1, 0, 0, 0);
                this.dateEnd = new Date(2018, 1, 1, 8, 0, 0);
            } else {
                this.dateStart = new Date(2018, 1, 1, this.object.start / 60, 0, 0);
                this.dateEnd = new Date(2018, 1, 1, (this.object.duration + this.object.start) / 60, 0, 0);
            }
        }
    }

    public get transaction(): pip.services.Transaction {
        return this.iqsShiftsViewModel.getTransaction();
    }

    public cancelClick() {
        this.edit = 'data';
        this.object = _.cloneDeep(this.oldObject);
        this.$location.search('edit', 'data');
        if (!this.pipMedia('gt-sm')) {
            this.details = true;
            this.$location.search('details', 'details');
        } else {
            this.$location.search('details', 'main');
            this.details = false;
        }
        this.$rootScope.$broadcast('iqsChangeNav');
    }

    public deleteClick() {
        let params: pip.dialogs.ConfirmationDialogParams = {};
        params.title = this.pipTranslate.translate("SHIFT_DELETE") + ' ' + this.object.name + ' ?';
        params.cancel = 'CANCEL';
        params.ok = 'DELETE';
        this.pipConfirmationDialog.show(params, () => {
            this.iqsShiftsViewModel.deleteShift(this.object.id, () => {
                this.edit = 'data';
                this.$location.search('edit', 'data');
                this.$location.search('details', 'main');
                this.details = false;
                this.$rootScope.$broadcast('iqsChangeNav');
            }, () => { });
        })
    }

    public saveClick() {
        if (this.form.$invalid) {
            this.pipFormErrors.resetFormErrors(this.form, true);

            return;
        }

        this.object.start = this.dateStart.getHours() * 60;
        this.object.duration = (this.dateEnd.getHours() - this.dateStart.getHours()) * 60;
        if (this.edit != 'add') {
            this.iqsShiftsViewModel.updateShift(this.object, (item) => {
                this.oldObject = _.cloneDeep(item);
                this.cancelClick();
            }, (err) => { })
        } else {
            this.object.org_id = this.iqsOrganization.orgId;
            this.iqsShiftsViewModel.saveShift(this.object, (item) => {
                this.object = item;
                this.cancelClick();
            }, (err) => {
                this.error = err.message || err;
            })
        }
        this.pipFormErrors.resetFormErrors(this.form, false);
    }

    public onPictureCreated(obj) {
        this.picture = obj.$control;
    };

    public onPictureChanged($control) {
        this.picture = $control;
    };

    public editClick() {
        this.edit = 'edit';
        this.nameCollection = [];
        _.each(this.iqsShiftsViewModel.shifts, (item: iqs.shell.Shift) => {
            if (this.object && this.object.id && this.object.id != item.id || !this.edit || !this.object.id) {
                // if (item.udi) this.nameCollection.push(item.udi);
                if (item.name) this.nameCollection.push(item.name);
            }
        });
    }

    public onResetClick() {
        this.picture.reset();
    };
}

(() => {
    angular
        .module('iqsConfigShiftEditPanel', ['pipTimeAutocomplete'])
        .component('iqsShiftEditPanel', {
            bindings: ConfigShiftEditPanelBindings,
            templateUrl: 'config/shifts/panels/ShiftsEditPanel.html',
            controller: ConfigShiftEditPanelController,
            controllerAs: '$ctrl'
        })
})();
