export type IReservation = {
    id?: number;
    date: Date;
    startTimeHour: number;
    startTimeMinute: number;
    endTimeHour: number;
    endTimeMinute: number;
    peopleCount: number;
    comment: string;
    customerId?: string;
    queueGroupId?: number;
};

export const ReservationTraitTypes = ['familyFriendly', 'smoker', 'handicapped', 'birthday'] as const;

export type ReservationTraitType = typeof ReservationTraitTypes[number];
