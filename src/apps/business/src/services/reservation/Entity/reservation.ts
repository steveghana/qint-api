import { Dependencies, injectDependencies } from '../../../../../util/dependencyInjector';
import reservationEntityGateway from '../DBGateway/reservationi';
import { IReservation, ReservationTraitType } from '../../../../../types/reservation';
import { ICustomer } from '../../../../../types/customer';
import { IQueueArea } from '../../../../../types/queueArea';
import { EntityManager } from 'typeorm';

type IReservationTrait = { type: ReservationTraitType };

class Reservation implements IReservation {
    private data: IReservation & {
        customer?: ICustomer;
        traits?: IReservationTrait[];
        areas?: { queueArea: IQueueArea }[];
    };

    private constructor(data: IReservation) {
        this.data = data;
    }

    static async create(
        reservation: IReservation,
        transaction: EntityManager = null,
        dependencies: Dependencies = null
    ): Promise<Reservation> {
        dependencies = injectDependencies(dependencies, ['db']);
        const data = await reservationEntityGateway.create(reservation, transaction, dependencies);
        return new Reservation(data);
    }

    static async getOfQueueGroup(transaction:EntityManager, queueGroupId: string, dependencies: Dependencies = null): Promise<Reservation[]> {
        dependencies = injectDependencies(dependencies, ['db']);
        const data = await reservationEntityGateway.findAllOfQueueGroup(transaction, queueGroupId, dependencies);
        const reservations = data.map(r => new Reservation(r));
        return reservations;
    }

    get id(): number {
        return this.data && this.data.id;
    }
    get date(): Date {
        return this.data && this.data.date;
    }
    get startTimeHour(): number {
        return this.data && this.data.startTimeHour;
    }
    get startTimeMinute(): number {
        return this.data && this.data.startTimeMinute;
    }
    get endTimeHour(): number {
        return this.data && this.data.endTimeHour;
    }
    get endTimeMinute(): number {
        return this.data && this.data.endTimeMinute;
    }
    get peopleCount(): number {
        return this.data && this.data.peopleCount;
    }
    get comment(): string {
        return this.data && this.data.comment;
    }
    get customer(): ICustomer {
        return this.data && this.data.customer;
    }
    get traits(): IReservationTrait[] {
        return this.data && this.data.traits;
    }
    get areas(): IQueueArea[] {
        return this.data && this.data.areas && this.data.areas.map(a => a.queueArea);
    }
}

export default Reservation;
