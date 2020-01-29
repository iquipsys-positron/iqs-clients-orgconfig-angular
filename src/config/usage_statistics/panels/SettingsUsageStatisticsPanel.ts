import { IStatisticsDateService, StatisticsDateSteps } from '../services';

interface ISettingsUsageStatisticsPanelBindings {
    [key: string]: any;

}

const SettingsUsageStatisticsPanelBindings: ISettingsUsageStatisticsPanelBindings = {

}

class SettingsUsageStatisticsPanelChanges implements ng.IOnChangesObject, ISettingsUsageStatisticsPanelBindings {
    [key: string]: ng.IChangesObject<any>;

}

class SettingsUsageStatisticsPanelController implements ng.IController {          // implements ISettingsUsageStatisticsPanelBindings {

    public $onInit() { }

    public startDate: Date | string;
    public endDate: Date | string;
    public dateType: string;
    public filterVisibility: iqs.shell.StatisticsFilterVisibility = {
        DeviceFilter: 2,
        DatePeriod: true
    };
    public filterValues: any = {};
    public filterParams: any = {};
    public formatX: Function;
    public formatY: Function;
    public statisticsObject: any;
    public view: string = 'chart';
    public statType: string = 'states';
    public isPreLoading: boolean = true;

    constructor(
        private $state: ng.ui.IStateService,
        private $interval: ng.IIntervalService,
        private $rootScope: ng.IRootScopeService,
        private iqsStatisticsViewModel: iqs.shell.IStatisticsViewModel,
        private $location: ng.ILocationService,
        private iqsStatisticsDateService: IStatisticsDateService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {

        this.startDate = this.iqsStatisticsDateService.getStartDate();
        this.endDate = this.iqsStatisticsDateService.getEndDate();
        this.dateType = this.iqsStatisticsDateService.getDateType();

        this.formatX = (x) => {
            return this.iqsStatisticsDateService.formatXTick(x, this.filterParams.datePeriod);
        }

        this.formatY = (y) => {
            let fY = Number(y).toFixed();

            return fY === String(y) ? fY : '';
        }

        const runWhenReady = () => {
            this.isPreLoading = false;
            this.setFilterValues();
            this.createStatisticsRequest();
        };

        if (this.iqsLoading.isDone) { runWhenReady(); }
        $rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady.bind(this));
    }

    public updateStatistics(params) {
        this.filterParams = params;
        this.filterParams.paramName = params.rule ? params.rule.name : params.paramName;
        this.filterParams.dateStep = StatisticsDateSteps[params.datePeriod];
        this.statisticsObject = params.object ? params.object : params.objectGroup;
        this.view = 'chart';
        this.setUrlParams(params);
        if (this.iqsLoading.isDone) { this.createStatisticsRequest(params); }
    }

    public get state() {
        return this.iqsStatisticsViewModel.state;
    }

    private setFilterValues() {
        this.filterValues = {
            deviceValue: this.$location.search()['device_stat_id'] ? this.$location.search()['device_stat_id'] : 'all'
        }
    }

    private setUrlParams(params) {
        this.$location.search('device_stat_id', params.deviceId);
        this.$location.search('date', params.fromDate.toISOString());
        this.$location.search('type', params.datePeriod);
    }

    private createStatisticsRequest(params = null, each = false) {
        let secondArg, thirdArg, startDate, endDate, dateType;

        this.startDate = this.iqsStatisticsDateService.getStartDate();
        this.endDate = this.iqsStatisticsDateService.getEndDate();
        this.dateType = this.iqsStatisticsDateService.getDateType();

        if (params !== null) {
            secondArg = params.deviceId || 'all';
        } else {
            secondArg = this.$location.search()['device_stat_id'] ? this.$location.search()['device_stat_id'] : 'all';
        }

        this.iqsStatisticsViewModel.getStatistics(this.statType, secondArg, null, null, this.startDate, this.endDate, this.dateType, false);
    }

    public changeView(newView, prevView) {
        if (newView === 'list' && (prevView === 'chart' || prevView === 'grid')) {
            this.createStatisticsRequest(null, true);
        }

        if (prevView === 'list' && (newView === 'chart' || newView === 'grid')) {
            this.createStatisticsRequest(null, false);
        }

        this.view = newView;
    }

    public get statistics() {
        return this.iqsStatisticsViewModel.statistics;
    }
}

(() => {
    angular
        .module('iqsSettingsUsageStatisticsPanel', [
            'iqsStatistics.ViewModel',
            'iqsStatistics.DateService',
            'iqsStatisticsFilterPanel'
        ])
        .component('iqsSettingsUsageStatisticsPanel', {
            bindings: SettingsUsageStatisticsPanelBindings,
            templateUrl: 'config/usage_statistics/panels/SettingsUsageStatisticsPanel.html',
            controller: SettingsUsageStatisticsPanelController,
            controllerAs: '$ctrl'
        })
})();
