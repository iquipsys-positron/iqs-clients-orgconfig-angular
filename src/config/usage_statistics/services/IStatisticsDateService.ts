export interface IStatisticsDateService {
    getStartDate(argName?: string, asString?: boolean): Date | string;
    getEndDate(argName?: string, asString?: boolean, t?: string): Date | string
    getDateType(argName?: string): string;
    formatXTick(x, type): Function;
    formatXGridTick(x, type): Function;
}
