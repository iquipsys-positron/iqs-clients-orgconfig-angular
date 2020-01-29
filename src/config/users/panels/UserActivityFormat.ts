import { IActivityFormatService } from './IUserActivityFormat';

class ActivityFormatService implements IActivityFormatService {
    constructor(
        private pipTranslate,
        private $rootScope: ng.IRootScopeService
    ) { }

    public formatActivityType(value: string): string {
        switch (value) {
            case 'party':
                return this.pipTranslate.translate('ACTIVITY_REF_PARTY');
            case 'connection':
                return this.pipTranslate.translate('ACTIVITY_REF_CONNECTION');
            case 'contact':
                return this.pipTranslate.translate('ACTIVITY_REF_CONTACT');
            case 'message':
                return this.pipTranslate.translate('ACTIVITY_REF_MESSAGE');
            case 'note':
                return this.pipTranslate.translate('ACTIVITY_REF_NOTE');
            case 'vision':
                return this.pipTranslate.translate('ACTIVITY_REF_VISION');
            case 'goal':
                return this.pipTranslate.translate('ACTIVITY_REF_GOAL');
            case 'event':
                return this.pipTranslate.translate('ACTIVITY_REF_EVENT');
            case 'time vision':
                return this.pipTranslate.translate('ACTIVITY_REF_TIME_VISION');
            case 'collage':
                return this.pipTranslate.translate('ACTIVITY_REF_COLLAGE');
            case 'post':
                return this.pipTranslate.translate('ACTIVITY_REF_POST');
            case 'support case':
                return this.pipTranslate.translate('ACTIVITY_REF_SUPPORT_CASE');
            default:
                return value;
        }
    }

    public getTransleted(activityType: string, refType: string): string {
        return this.$rootScope['$language'] == 'en' ?
            this.pipTranslate.translate('ACTIVITY_TYPE_PARTY_' + activityType) :
            this.pipTranslate.translate('ACTIVITY_TYPE_' + refType.toUpperCase() + '_' + activityType);
    }

    public formatActivity(activity: any): string {
        switch (activity.type) {
            case 'account created':
                return this.pipTranslate.translate('ACTIVITY_TYPE_SIGNUP');
            case 'signin':
                return this.pipTranslate.translate('ACTIVITY_TYPE_SIGNIN');
            case 'password changed':
                return this.pipTranslate.translate('ACTIVITY_TYPE_PWD_CHANGE');
            case 'password recovered':
                return this.pipTranslate.translate('ACTIVITY_TYPE_PWD_RECOVER');
            case 'email verified':
                return this.pipTranslate.translate('ACTIVITY_TYPE_EMAIL_VERIFY');
            case 'account changed':
                return this.pipTranslate.translate('ACTIVITY_TYPE_USER_UPDATE');
            case 'partnered':
                return this.pipTranslate.translate('ACTIVITY_TYPE_PARTNER')
                    + ' "' + this.formatActivityType(activity.ref_type)
                    + '" ' + ' ' + activity.ref_name;
            case 'followed':
                return this.pipTranslate.translate('ACTIVITY_TYPE_FOLLOW_ATTACH')
                    + ' ' + activity.ref_name;
            case 'disconnected':
                return this.pipTranslate.translate('ACTIVITY_TYPE_PARTY_DETACH')
                    + ' ' + activity.ref_name;
            case 'created':
                return this.getTransleted('CREATE', activity.ref_type)
                    + ' ' + this.formatActivityType(activity.ref_type)
                    + ' ' + activity.ref_name;
            case 'deleted':
                return this.getTransleted('DELETE', activity.ref_type)
                    + ' ' + this.formatActivityType(activity.ref_type)
                    + ' ' + activity.ref_name;
            case 'accepted':
                return this.getTransleted('ACCEPT', activity.ref_type)
                    + ' ' + this.formatActivityType(activity.ref_type)
                    + ' ' + activity.ref_name
                    + ' ' + this.pipTranslate.translate('ACTIVITY_TYPE_BY')
                    + ' ' + activity.party_name;
            case 'rejected':
                return this.getTransleted('REJECT', activity.ref_type)
                    + ' ' + this.formatActivityType(activity.ref_type)
                    + ' ' + activity.ref_name
                    + ' ' + this.pipTranslate.translate('ACTIVITY_TYPE_BY')
                    + ' ' + activity.party_name;
            case 'joined':
                return this.pipTranslate.translate('ACTIVITY_TYPE_PARTY_JOIN')
                    + ' ' + this.formatActivityType(activity.ref_type)
                    + ' ' + activity.ref_name
                    + ' ' + this.pipTranslate.translate('ACTIVITY_TYPE_BY')
                    + ' ' + activity.party_name;
            case 'completed':
                return this.getTransleted('COMPLETE', activity.ref_type)
                    + ' ' + this.formatActivityType(activity.ref_type)
                    + ' ' + activity.ref_name;
            case 'progress':
                return this.pipTranslate.translate('ACTIVITY_TYPE_PARTY_PROGRESS')
                    + ' ' + this.formatActivityType(activity.ref_type)
                    + ' ' + activity.ref_name;
            case 'canceled':
                return this.getTransleted('CANCEL', activity.ref_type)
                    + ' ' + this.formatActivityType(activity.ref_type)
                    + ' ' + activity.ref_name;
            case 'buzzed':
                return this.pipTranslate.translate('ACTIVITY_TYPE_PARTY_BUZZ')
                    + ' ' + activity.ref_name
                    + ' ' + this.pipTranslate.translate('ACTIVITY_TYPE_BY')
                    + ' ' + activity.party_name;
            case 'commented':
                return this.pipTranslate.translate('ACTIVITY_TYPE_PARTY_COMMENT')
                    + ' ' + activity.ref_name
                    + ' ' + this.pipTranslate.translate('ACTIVITY_TYPE_BY')
                    + ' ' + activity.party_name;
            case 'cheered':
                return this.pipTranslate.translate('ACTIVITY_TYPE_PARTY_CHEER')
                    + ' ' + activity.ref_name
                    + ' ' + this.pipTranslate.translate('ACTIVITY_TYPE_BY')
                    + ' ' + activity.party_name;
            case 'posted':
                return this.pipTranslate.translate('ACTIVITY_TYPE_PARTY_POST')
                    + ' ' + activity.ref_name;
        }
    }
}

(() => {
    function ActivityFormatConfig(pipTranslateProvider) {

        pipTranslateProvider.translations('en', {
            'ACTIVITY_TYPE_SIGNUP': 'Signed up',
            'ACTIVITY_TYPE_SIGNIN': 'Signed in',
            'ACTIVITY_TYPE_PWD_CHANGE': 'Changed password',
            'ACTIVITY_TYPE_PWD_RECOVER': 'Requested password recovery',
            'ACTIVITY_TYPE_EMAIL_VERIFY': 'Verified primary email address',
            'ACTIVITY_TYPE_USER_UPDATE': 'Changed user settings',
            'ACTIVITY_TYPE_PARTNER': 'Partnered with',
            'ACTIVITY_TYPE_FOLLOW_ATTACH': 'Followed',
            'ACTIVITY_TYPE_PARTY_DETACH': 'Disconnected from',

            // Party
            'ACTIVITY_TYPE_PARTY_CREATE': 'Created',
            'ACTIVITY_TYPE_PARTY_DELETE': 'Deleted',
            'ACTIVITY_TYPE_PARTY_ACCEPT': 'Accepted',
            'ACTIVITY_TYPE_PARTY_REJECT': 'Rejected',
            'ACTIVITY_TYPE_PARTY_JOIN': 'Joined',
            'ACTIVITY_TYPE_PARTY_COMPLETE': 'Completed',
            'ACTIVITY_TYPE_PARTY_CANCEL': 'Canceled',
            'ACTIVITY_TYPE_PARTY_BUZZ': 'Buzzed status',
            'ACTIVITY_TYPE_PARTY_COMMENT': 'Commented status',
            'ACTIVITY_TYPE_PARTY_CHEER': 'Cheered status',
            'ACTIVITY_TYPE_PARTY_POST': 'Posted status',
            'ACTIVITY_TYPE_PARTY_PROGRESS': 'Made progress on',

            'ACTIVITY_TYPE_BY': 'by',

            'ACTIVITY_REF_PARTY': 'party',
            'ACTIVITY_REF_CONNECTION': 'connection',
            'ACTIVITY_REF_CONTACT': 'contact',
            'ACTIVITY_REF_MESSAGE': 'message',
            'ACTIVITY_REF_NOTE': 'note',
            'ACTIVITY_REF_AREA': 'area',
            'ACTIVITY_REF_VISION': 'vision',
            'ACTIVITY_REF_GOAL': 'goal',
            'ACTIVITY_REF_EVENT': 'event',
            'ACTIVITY_REF_TIME_VISION': 'time vision',
            'ACTIVITY_REF_COLLAGE': 'collage',
            'ACTIVITY_REF_SUPPORT_CASE': 'support case',
            'ACTIVITY_REF_POST': 'post'
        });

        pipTranslateProvider.translations('ru', {
            'ACTIVITY_TYPE_SIGNUP': 'Регистрация',
            'ACTIVITY_TYPE_SIGNIN': 'Вход выполнен',
            'ACTIVITY_TYPE_PWD_CHANGE': 'Изменен пароль',
            'ACTIVITY_TYPE_PWD_RECOVER': 'Запрос на восстановление пароля',
            'ACTIVITY_TYPE_EMAIL_VERIFY': 'Подтвержден основной почтовый адрес',
            'ACTIVITY_TYPE_USER_UPDATE': 'Изменены настройки аккаунта',
            'ACTIVITY_TYPE_PARTNER': 'В партнерстве с ',
            'ACTIVITY_TYPE_FOLLOW_ATTACH': 'Подписаны на',
            'ACTIVITY_TYPE_PARTY_DETACH': 'Отключены от',

            // Party
            'ACTIVITY_TYPE_PARTY_CREATE': 'Создано',
            'ACTIVITY_TYPE_PARTY_DELETE': 'Удалено',
            'ACTIVITY_TYPE_PARTY_ACCEPT': 'Принято',
            'ACTIVITY_TYPE_PARTY_REJECT': 'Отклонено',
            'ACTIVITY_TYPE_PARTY_JOIN': 'Присоединились к ',
            'ACTIVITY_TYPE_PARTY_COMPLETE': 'Завершено',
            'ACTIVITY_TYPE_PARTY_CANCEL': 'Отменено',
            'ACTIVITY_TYPE_PARTY_BUZZ': 'Пересылка поста',
            'ACTIVITY_TYPE_PARTY_COMMENT': 'Прокоментирован',
            'ACTIVITY_TYPE_PARTY_CHEER': 'Одобрен пост',
            'ACTIVITY_TYPE_PARTY_POST': 'Добавлен статус',
            'ACTIVITY_TYPE_PARTY_PROGRESS': 'Достигнут прогресс в',

            // Connection
            'ACTIVITY_TYPE_CONNECTION_CREATE': 'Создана',
            'ACTIVITY_TYPE_CONNECTION_DELETE': 'Удалена',
            'ACTIVITY_TYPE_CONNECTION_ACCEPT': 'Принята',
            'ACTIVITY_TYPE_CONNECTION_REJECT': 'Отклонена',
            'ACTIVITY_TYPE_CONNECTION_COMPLETE': 'Завершена',
            'ACTIVITY_TYPE_CONNECTION_CANCEL': 'Отменена',

            // Contact
            'ACTIVITY_TYPE_CONTACT_CREATE': 'Создан',
            'ACTIVITY_TYPE_CONTACT_DELETE': 'Удален',
            'ACTIVITY_TYPE_CONTACT_ACCEPT': 'Принят',
            'ACTIVITY_TYPE_CONTACT_REJECT': 'Отклонен',
            'ACTIVITY_TYPE_CONTACT_COMPLETE': 'Завершен',
            'ACTIVITY_TYPE_CONTACT_CANCEL': 'Отменен',

            // Message
            'ACTIVITY_TYPE_MESSAGE_CREATE': 'Создано',
            'ACTIVITY_TYPE_MESSAGE_DELETE': 'Удалено',
            'ACTIVITY_TYPE_MESSAGE_ACCEPT': 'Принято',
            'ACTIVITY_TYPE_MESSAGE_REJECT': 'Отклонено',
            'ACTIVITY_TYPE_MESSAGE_COMPLETE': 'Завершено',
            'ACTIVITY_TYPE_MESSAGE_CANCEL': 'Отменено',

            // Note
            'ACTIVITY_TYPE_NOTE_CREATE': 'Создана',
            'ACTIVITY_TYPE_NOTE_DELETE': 'Удалена',
            'ACTIVITY_TYPE_NOTE_ACCEPT': 'Принята',
            'ACTIVITY_TYPE_NOTE_REJECT': 'Отклонена',
            'ACTIVITY_TYPE_NOTE_COMPLETE': 'Завершена',
            'ACTIVITY_TYPE_NOTE_CANCEL': 'Отменена',

            // Area
            'ACTIVITY_TYPE_AREA_CREATE': 'Создана',
            'ACTIVITY_TYPE_AREA_DELETE': 'Удалена',
            'ACTIVITY_TYPE_AREA_ACCEPT': 'Принята',
            'ACTIVITY_TYPE_AREA_REJECT': 'Отклонена',
            'ACTIVITY_TYPE_AREA_COMPLETE': 'Завершена',
            'ACTIVITY_TYPE_AREA_CANCEL': 'Отменена',

            // Goal
            'ACTIVITY_TYPE_GOAL_CREATE': 'Создана',
            'ACTIVITY_TYPE_GOAL_DELETE': 'Удалена',
            'ACTIVITY_TYPE_GOAL_ACCEPT': 'Принята',
            'ACTIVITY_TYPE_GOAL_REJECT': 'Отклонена',
            'ACTIVITY_TYPE_GOAL_COMPLETE': 'Завершена',
            'ACTIVITY_TYPE_GOAL_CANCEL': 'Отменена',

            // Event
            'ACTIVITY_TYPE_EVENT_CREATE': 'Создано',
            'ACTIVITY_TYPE_EVENT_DELETE': 'Удалено',
            'ACTIVITY_TYPE_EVENT_ACCEPT': 'Принято',
            'ACTIVITY_TYPE_EVENT_REJECT': 'Отклонено',
            'ACTIVITY_TYPE_EVENT_COMPLETE': 'Завершено',
            'ACTIVITY_TYPE_EVENT_CANCEL': 'Отменено',

            // Vision
            'ACTIVITY_TYPE_VISION_CREATE': 'Создано',
            'ACTIVITY_TYPE_VISION_DELETE': 'Удалено',
            'ACTIVITY_TYPE_VISION_ACCEPT': 'Принято',
            'ACTIVITY_TYPE_VISION_REJECT': 'Отклонено',
            'ACTIVITY_TYPE_VISION_COMPLETE': 'Завершено',
            'ACTIVITY_TYPE_VISION_CANCEL': 'Отменено',

            // Post
            'ACTIVITY_TYPE_POST_CREATE': 'Создан',
            'ACTIVITY_TYPE_POST_DELETE': 'Удален',
            'ACTIVITY_TYPE_POST_ACCEPT': 'Принят',
            'ACTIVITY_TYPE_POST_REJECT': 'Отклонен',
            'ACTIVITY_TYPE_POST_COMPLETE': 'Завершен',
            'ACTIVITY_TYPE_POST_CANCEL': 'Отменен',

            'ACTIVITY_TYPE_BY': 'от',

            'ACTIVITY_REF_PARTY': 'участник',
            'ACTIVITY_REF_CONNECTION': 'связь',
            'ACTIVITY_REF_CONTACT': 'контакт',

            'ACTIVITY_REF_MESSAGE': 'сообщение',
            'ACTIVITY_REF_NOTE': 'заметка',
            'ACTIVITY_REF_AREA': 'область',
            'ACTIVITY_REF_VISION': 'видение',
            'ACTIVITY_REF_GOAL': 'цель',
            'ACTIVITY_REF_EVENT': 'задание',
            'ACTIVITY_REF_TIME_VISION': 'видение во времени',
            'ACTIVITY_REF_COLLAGE': 'коллаж',
            'ACTIVITY_REF_POST': 'пост',
            'ACTIVITY_REF_SUPPORT_CASE': 'квиток тех.поддержки'
        });

    }
    angular.module('iqsActivityFormat', ['pipTranslate'])
        .config(ActivityFormatConfig)
        .service('iqsActivityFormat', ActivityFormatService);

})();
