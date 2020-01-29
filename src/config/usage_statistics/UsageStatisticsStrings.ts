{
    function declareUsageStatisticsResources(pipTranslateProvider: pip.services.ITranslateProvider) {
        pipTranslateProvider.translations('en', {
            USAGE_STATISTICS_TITLE: 'Usage statistics',
            USAGE_STATISTICS: 'Usage statistics',
            STATISTICS_BY_ALL_DEVICES: 'Statistics by all devices',
            STATISTICS_BY_DEVICE: 'Statistics by device',
            STATISTICS_STATE_UPDATES: 'Number of events',
            STATISTICS_STATE_ERRORS: 'Errors in processing',
            STATISTICS_LOADING_TITLE: 'Statistics loading...',
            STATISTICS_BY_PARAM: 'Statistics by parameter',
            STATISTICS_HOUR: 'Time',
            STATISTICS_DAY: 'Day',
            STATISTICS_MONTH: 'Month',
            FOR_DATE: 'for',
            FOR_DATE_WEEK: 'for week from',
        });
        pipTranslateProvider.translations('ru', {
            USAGE_STATISTICS_TITLE: 'Использование',
            USAGE_STATISTICS: 'Статистики использования',
            STATISTICS_LOADING_TITLE: 'Статистики загружаются...',
            STATISTICS_BY_PARAM: 'Статистика по параметру',
            STATISTICS_BY_ALL_DEVICES: 'Статистика по всем устройствам',
            STATISTICS_BY_DEVICE: 'Статистика по устройству',
            STATISTICS_STATE_UPDATES: 'Количество событий',
            STATISTICS_STATE_ERRORS: 'Ошибки при обработке',
            STATISTICS_HOUR: 'Время',
            STATISTICS_DAY: 'День',
            STATISTICS_MONTH: 'Месяц',
            FOR_DATE: 'за',
            FOR_DATE_WEEK: 'за неделю с',
        });
    }

    angular
        .module('iqsConfigUsageStatistics')
        .config(declareUsageStatisticsResources);
}
