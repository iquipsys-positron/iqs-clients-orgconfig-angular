
{
    function declareConfigTranslateResources(pipTranslateProvider: pip.services.ITranslateProvider) {
        pipTranslateProvider.translations('en', {
            GROUPS: 'Groups',
            LOCATIONS: 'Locations',
            SETTINGS_SYSTEM: 'Configuration',
        });

        pipTranslateProvider.translations('ru', {
            GROUPS: 'Группы',
            LOCATIONS: 'Места',
            SETTINGS_SYSTEM: 'Настройки',
        });
    }

    angular
        .module('iqsConfig')
        .config(declareConfigTranslateResources);
}
