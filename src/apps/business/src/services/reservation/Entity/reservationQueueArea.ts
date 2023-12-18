import { EntityManager } from 'typeorm';
import { Dependencies, injectDependencies } from '../../../../../util/dependencyInjector';
import reservationQueueAreaEntityGateway from '../DBGateway/reservationQueueArea';

class ReservationQueueArea {
    static async bulkCreate(
        reservationId: number,
        areaIds: number[],
        transaction: EntityManager = null,
        dependencies: Dependencies = null
    ): Promise<void> {
        dependencies = injectDependencies(dependencies, ['db']);
        await reservationQueueAreaEntityGateway.bulkCreate(reservationId, areaIds, transaction, dependencies);
    }
}

export default ReservationQueueArea;
