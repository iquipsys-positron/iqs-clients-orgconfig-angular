(() => {

    const translateShiftsConfig = function (pipTranslateProvider) {
        // Set translation strings for the module
        pipTranslateProvider.translations('en', {
            'SHIFTS': 'Shifts',
            'SHIFT_START': 'Start time',
            'SHIFT_END': 'End time',
            'SHIFT_NAME': 'Shift name',
            "NEW SHIFT": 'New shift',
            'SHIFTS_EMPTY': 'Shifts were not found',
            'ADD_SHIFT': 'Add shift',
            'SHIFTS_PLACEHOLDER': 'shift will finish on the next day',
            'SHIFT_DELETE': 'Shift delete',
            'SHIFT_NAME_EMPTY': 'Shift name is empty',
            'SHIFT_FILL_NAME': 'Fill shift name',
            'MONITORING_SHIFTS_DETAILS': 'Shift',
            'SHIFTS_EMPTY1': 'Shifts define periodic time intervals to plan work activities on sites',
            LOADING_SHIFTS: 'Loading shifts',
            SHIFT_FILL_NAME_UNIQUE_ERROR: 'The entered name is already in use',
            SHIFT_ID: 'System identifier'
        });

        pipTranslateProvider.translations('ru', {
            'SHIFTS': 'Смены',
            'SHIFT_START': 'Время начала',
            'SHIFT_END': 'Время конца',
            'SHIFT_NAME': 'Название',
            "NEW SHIFT": 'Новая смена',
            'ADD_SHIFT': 'Добавить смену',
            "SHIFTS_EMPTY": 'Смены не найдены.',
            'SHIFT_DELETE': 'Удалить смену ',

            'SHIFTS_PLACEHOLDER': 'смена заканчивается на следующий день',
            'SHIFT_NAME_EMPTY': 'Название смены должно быть заполнено',
            'SHIFT_FILL_NAME': 'Заполните название смены',
            'SHIFTS_EMPTY1': 'Смены определяют периодические интервалы времени для планирования деятельности на рабочей площадке',
            'MONITORING_SHIFTS_DETAILS': 'Смена',
            LOADING_SHIFTS: 'Загрузка смен',
            SHIFT_FILL_NAME_UNIQUE_ERROR: 'Введенное имя уже используется',
            SHIFT_ID: 'Системный идентификатор'
        });
    }


    angular
        .module('iqsConfigShifts')
        .config(translateShiftsConfig);

})();
