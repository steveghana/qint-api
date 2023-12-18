import { EntityManager } from 'typeorm';
import {
  Dependencies,
  injectDependencies,
} from '../../../../../util/dependencyInjector';

async function bulkCreate(
  reservationId: number,
  areaIds: number[],
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  const reservationQueueAreaRepo = transaction.getRepository(
    dependencies.db.models.reservationQueueArea,
  );

  areaIds.map((area) =>
    reservationQueueAreaRepo
      .createQueryBuilder()
      .insert()
      .into('reservationQueueArea')
      .values({
        reservationId,
        queueAreaId: area,
      })
      .execute(),
  );
}

export default { bulkCreate };
