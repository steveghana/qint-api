import { Dependencies, injectDependencies } from '../../../../../util/dependencyInjector';
import reservationTraitEntityGateway from '../DBGateway/reservationTrait';
import { ReservationTraitType } from '../../../../../types/reservation';
import { EntityManager } from 'typeorm';

class ReservationTrait {
    static async bulkCreate(
        reservationId: number,
        types: ReservationTraitType[],
        transaction: EntityManager = null,
        dependencies: Dependencies = null
    ): Promise<void> {
        dependencies = injectDependencies(dependencies, ['db']);
        await reservationTraitEntityGateway.bulkCreate(reservationId, types, transaction, dependencies);
    }
}

export default ReservationTrait;
