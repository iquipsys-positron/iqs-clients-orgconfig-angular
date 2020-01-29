export class StatisticsFormatXTick {
    public static yearly(x, months): string {
        return months ? months[x - 1] : x;
    }

    public static monthly(x): string {
        return Number(x).toFixed(0);
    }

    public static weekly(x, months, days): string {
        return days ? (x === 6 ? days[0] : days[x + 1]) : x;
    }

    public static daily(x): string {
        x = Number(x).toFixed(0);
        return x + ':00';
    }

    public static shift(x): string {
        let date = new Date(x);
        let h = String(date.getHours());
        let m = String(date.getMinutes());

        return (h.length < 2 ? '0' + h : h) + ':' + (m.length < 2 ? '0' + m : m);
    }

    public static range(x): string {
        let date = new Date(x);
        let h = String(date.getHours());
        let m = String(date.getMinutes());

        return (h.length < 2 ? '0' + h : h) + ':' + (m.length < 2 ? '0' + m : m);
    }
}