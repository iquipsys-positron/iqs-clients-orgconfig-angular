import { IStatisticsDateService } from './IStatisticsDateService';
import { StatisticsDateType } from './StatisticsDateType';
import { StatisticsFormatXTick } from './StatisticsFormatXTick';

class StatisticsDateService implements IStatisticsDateService {
    private DATE_ARG_NAME: string = 'date';
    private DATE_TYPE_ARG_NAME: string = 'type';
    private months: string[];
    private shortMonths: string[];
    private days: string[];
    private shortDays: string[];
    private localeDate: any;//moment.MomentLanguageData;

    constructor(
        private $location: ng.ILocationService,
        private $rootScope: ng.IRootScopeService,
        private iqsStatisticsViewModel: iqs.shell.IStatisticsViewModel
    ) {
        "ngInject";

        this.$rootScope.$on(pip.services.LanguageChangedEvent, () => {
            this.initLocaleArrays();
        });

        this.initLocaleArrays();
    }

    private initLocaleArrays(): void {
        this.localeDate = moment.localeData();
        // this.months = angular.isArray(this.localeDate['_months']) ? this.localeDate['_months'] : this.localeDate['_months'].format;
        // this.days = angular.isArray(this.localeDate['_weekdays']) ? this.localeDate['_weekdays'] : this.localeDate['_weekdays'].format;
        // this.shortDays = angular.isArray(this.localeDate['_weekdaysMin']) ? this.localeDate['_weekdaysMin'] : this.localeDate['_weekdaysMin'].format;
        // this.shortMonths = angular.isArray(this.localeDate['_monthsShort']) ? this.localeDate['_monthsShort'] : this.localeDate['_monthsShort'].format;

        this.months = angular.isArray(this.localeDate._months) ? this.localeDate._months : this.localeDate._months.standalone;
        this.days = angular.isArray(this.localeDate._weekdays) ? this.localeDate._weekdays : this.localeDate._weekdays.format;
        this.shortDays = this.localeDate._weekdaysMin;
        this.shortMonths = angular.isArray(this.localeDate['_monthsShort']) ? this.localeDate['_monthsShort'] : this.localeDate['_monthsShort'].format;

    }

    public getStartDate(argName: string = this.DATE_ARG_NAME, asString: boolean = false): Date | string {
        let res = this.$location.search()[argName] ? new Date(Date.parse(this.$location.search()[argName])) : this.iqsStatisticsViewModel.lastRequestDate || new Date();
        let type = this.$location.search()[this.DATE_TYPE_ARG_NAME] || StatisticsDateType.daily;
        if (type != StatisticsDateType.shift || type != StatisticsDateType.range) res = moment(res).startOf('day').toDate();

        else moment(res).toDate();

        return asString ? res.toISOString() : res;
    }

    public getEndDate(argName: string = this.DATE_ARG_NAME, asString: boolean = false, t?: string): Date | string {
        let start = this.$location.search()[argName] ? new Date(Date.parse(this.$location.search()[argName])) : this.iqsStatisticsViewModel.lastRequestDate || new Date();
        let type = t || this.$location.search()[this.DATE_TYPE_ARG_NAME] || StatisticsDateType.daily;
        let res;

        start = moment(start).startOf('day').toDate();

        switch (type) {
            case StatisticsDateType.daily: {
                res = moment(start).add('days', 1).add('minutes', -1).toDate();
                break;
            }

            case StatisticsDateType.weekly: {
                res = moment(start).add('weeks', 1).add('minutes', -1).toDate();
                break;
            }

            case StatisticsDateType.monthly: {
                res = moment(start).add('months', 1).add('minutes', -1).toDate();
                break;
            }

            case StatisticsDateType.yearly: {
                res = moment(start).add('years', 1).add('minutes', -1).toDate();
                break;
            }

            default: { // StatisticsDateType.shift and StatisticsDateType.range
                res = new Date(Date.parse(this.$location.search()['to_date']));
                break;
            }
        }

        return asString ? res.toISOString() : res;
    }

    public getDateType(argName: string = this.DATE_TYPE_ARG_NAME) {
        return this.$location.search()[argName] || this.iqsStatisticsViewModel.lastRequestType || StatisticsDateType.daily;
    }

    public formatXTick(x, type) {
        type = type || this.iqsStatisticsViewModel.lastRequestType || StatisticsDateType.daily;
        return StatisticsFormatXTick[type](x, this.shortMonths, this.shortDays);
    }

    public formatXGridTick(x, type) {
        type = type || this.iqsStatisticsViewModel.lastRequestType || StatisticsDateType.daily;
        return StatisticsFormatXTick[type](x, this.months, this.days);
    }
}

{
    angular.module('iqsStatistics.DateService', [])
        .service('iqsStatisticsDateService', StatisticsDateService);

}