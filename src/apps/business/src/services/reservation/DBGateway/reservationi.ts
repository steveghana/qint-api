import { Dependencies, injectDependencies } from '../../../../../util/dependencyInjector';
import { IReservation, ReservationTraitType } from '../../../../../types/reservation';
import { ICustomer } from '../../../../../types/customer';
import { IQueueArea } from '../../../../../types/queueArea';
import { EntityManager } from 'typeorm';

async function create(
    reservation: IReservation,
    transaction: EntityManager = null,
    dependencies: Dependencies = null
): Promise<IReservation> {
    dependencies = injectDependencies(dependencies, ['db']);
    const reservationRepo = transaction.getRepository(dependencies.db.models.reservation)
    const created = await reservationRepo.create(reservation);
await reservationRepo.save(created)
    return created;
}

async function findAllOfQueueGroup(
    transaction:EntityManager,
    queueGroupId: string,
    dependencies: Dependencies = null
): Promise<
    Array<
        IReservation & {
            customer?: ICustomer;
            traits?: { type: ReservationTraitType }[];
            areas?: { queueArea: IQueueArea }[];
        }
    >
> {
    const reservationRepo = transaction.getRepository(dependencies.db.models.reservation)
    dependencies = injectDependencies(dependencies, ['db']);

   const found =  reservationRepo.createQueryBuilder('reservation')
      .select([
        'reservation.customer',
        'reservation.reservationTrait AS traits',
        'reservation.reservationQueueArea AS areas',
        'reservation.reservationQueueArea.queueArea',
      ]).where('reservation.queueGroupId = :id', { id: Number(queueGroupId) })
      .getRawMany();
    // const found = await dependencies.db.models.reservation.find({
    //     where: { queueGroup:{id: Number(queueGroupId)} },
    //     relations : ['customer', 'reservationTrait', 'reservationQueueArea', 'reservationQueueArea.queueArea']
       
    // });
    return found;
}

export default {
    create,
    findAllOfQueueGroup,
};
