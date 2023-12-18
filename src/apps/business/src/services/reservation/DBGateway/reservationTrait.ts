import { EntityManager } from 'typeorm';
import { Dependencies, injectDependencies } from '../../../../../util/dependencyInjector';
import { ReservationTraitType } from '../../../../../types/reservation';

async function bulkCreate(
    reservationId: number,
    types: ReservationTraitType[],
    transaction: EntityManager = null,
    dependencies: Dependencies = null
): Promise<void> {
    dependencies = injectDependencies(dependencies, ['db']);
    const resTraitRepo = transaction.getRepository(dependencies.db.models.reservationTrait)
    types.map(type => (
    resTraitRepo
      .createQueryBuilder()
      .insert()
      .values({
        reservationId,
        type
      } as any)
      .execute()))
  
}

export default { bulkCreate };
