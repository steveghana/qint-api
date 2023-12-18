import {
  injectDependencies,
  Dependencies,
} from '../../../../../util/dependencyInjector';
import { IQueueArea } from '../../../../../types/queueArea';
import { ensureTransaction } from '../../../../../Config/transaction';
import { IQueueAreaTrait } from '../../../../../types/queueAreaTrait';
import { DeepPartial, EntityManager } from 'typeorm';
import { QueueAreaTrait } from '../../../models/AreaTraits/queueAreaTrait.entity';
// import { RedisCacheService } from '@/apps/redis/redis.service';
import { Cache } from 'cache-manager';
import myDataSource from '../../../../../../../db/data-source';
import { QueueArea } from '../../../models/Area/queueArea.entity';

async function getAreasOfQueueGroup(
  transaction: EntityManager,
  cacheManager: Cache,

  queueGroupId: string,
  dependencies: Dependencies = null,
): Promise<IQueueArea[]> {
  // const cache = dependencies.db.cache;
  dependencies = injectDependencies(dependencies, ['db']);
  const queueAreaRepo = transaction.getRepository(
    dependencies.db.models.queueArea,
  );
  // const key = `queueArea:${queueGroupId}`;
  // const cachedData = (await cache.get(key)) as IQueueArea[];
  // console.log(cachedData)
  // if (cachedData) {
  //   return cachedData;
  // }

  let areas = await queueAreaRepo
    .createQueryBuilder('queueArea')
    .leftJoinAndSelect('queueArea.traits', 'traits')
    .leftJoinAndSelect('queueArea.queueAreaQueueTable', 'queueAreaQueueTable')
    .leftJoinAndSelect('queueAreaQueueTable.queueGroupTable', 'queueGroupTable')
    .leftJoinAndSelect('queueArea.queueGroup', 'queueGroup')
    .where('queueArea.queueGroupId = :id', { id: Number(queueGroupId) })
    .getMany();
  // await this.cache.set(key, areas);
  let tables = areas.map((area) =>
    area.queueAreaQueueTable.map((item) => item.queueGroupTable),
  );
  const areasWithTables = areas.map((area, i) => ({
    tables: tables[i],
    ...area,
  }));
  return areasWithTables as unknown as IQueueArea[];
}
type partialArea = Partial<DeepPartial<QueueArea> & { queueGroupId: number }>;

export async function createAreas(
  cacheManager: Cache,

  areas: Partial<
    Omit<IQueueArea, 'traits'> & {
      traits?: Omit<IQueueAreaTrait, 'id' | 'queueAreaId'>[];
    }
  >[],

  transactionParam: EntityManager = null,

  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  // const cache = dependencies.db.cache;
  const queueAreaRepo = transactionParam.getRepository(
    dependencies.db.models.queueArea,
  );
  const queueGroupRepo = transactionParam.getRepository(
    dependencies.db.models.queueGroup,
  );
  const queueAreaTraitRepo = transactionParam.getRepository(
    dependencies.db.models.queueAreaTrait,
  );

  await ensureTransaction(
    transactionParam,
    async (transaction) => {
      const newAreas = await queueAreaRepo
        .createQueryBuilder()
        .insert()
        .values(
          areas.map((area) => ({
            queueGroupId: area.queueGroupId,
            name: { english: area.name.english, hebrew: area.name.hebrew },
          })),
        )
        .execute();
      await Promise.all(
        (newAreas.generatedMaps || []).map(async (newArea, newAreaIndex) => {
          await queueAreaTraitRepo
            .createQueryBuilder()
            .insert()
            .values(
              (areas[newAreaIndex].traits || []).map((trait) => ({
                ...trait,
                queueAreaId: newArea.id,
              })),
            )
            .execute();
        }),
      );
      // clear cache for the getAreasOfQueueGroup function since it may have changed
      // cache.del(`queueArea${areas[0].queueGroupId}`);
    },
    dependencies,
  );
}

export async function deleteAreas(
  cacheManager: Cache,

  queueGroupId: string,
  areaIds: number[],

  transaction: EntityManager = null,

  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  const cache = dependencies.db.cache;
  const queueAreaRepo = transaction.getRepository(
    dependencies.db.models.queueArea,
  );

  await Promise.all(
    areaIds.map((num) => {
      queueAreaRepo.delete({
        id: num,
        // queueGroup: { id: Number(queueGroupId) },
      });
    }),
  );
  // cache.del(`queueArea${queueGroupId}`);
}

export async function updateArea(
  cacheManager: Cache,

  queueGroupId: number,
  areas: Partial<IQueueArea>[],

  transactionParam: EntityManager = null,

  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  const cache = dependencies.db.cache;
  const queueAreaRepo = transactionParam.getRepository(
    dependencies.db.models.queueArea,
  );
  type s = {
    queueAreaId: number;
  } & DeepPartial<QueueAreaTrait>;
  await ensureTransaction(
    transactionParam,
    async (transaction) => {
      await Promise.all(
        areas.map(async (area) => {
          await queueAreaRepo.update(
            {
              id: area.id,
              queueGroup: {
                id: queueGroupId,
              },
            },
            { name: area.name },
          );

          if (area.traits) {
            await transactionParam
              .getRepository(dependencies.db.models.queueAreaTrait)
              .delete({
                queueArea: {
                  id: area.id,
                },
              });
            await transactionParam
              .getRepository(dependencies.db.models.queueAreaTrait)
              .createQueryBuilder()
              .insert()
              .into(QueueAreaTrait)
              .values(
                area.traits.map((trait) => ({
                  ...trait,
                  queueAreaId: area.id,
                })),
              )
              .execute();
          }
        }),
      );
      // cache.del(`queueArea${queueGroupId}`);
    },
    dependencies,
  );
}

export default {
  getAreasOfQueueGroup,
  createAreas,
  deleteAreas,
  updateArea,
};
