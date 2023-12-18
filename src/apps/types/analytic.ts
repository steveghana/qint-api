export type DayAnalytic = {
    totalVisitors: number;
    averageWaitingTime: number;
    medianWaitingTime: number;
    leaveReasons: {
        null: number;
        served: number;
        quit: number;
        removed: number;
    };
};

type HourAnalytic = {
    totalVisitors: number;
};

export type IAnalytic = {
    byWeekDay: DayAnalytic[];
    byHour: HourAnalytic[];
};
