export interface IActivityFormatService {
    formatActivityType(value: string): string;
    getTransleted(activityType: string, refType: string): string;
    formatActivity(activity: any): string;
}