import {
  injectDependencies,
  Dependencies,
} from '../../../../../util/dependencyInjector';
import { IQueueGroupTable } from '../../../../../types/queueGroupTable';
import { ensureTransaction } from '../../../../../Config/transaction';
import { EntityManager, In } from 'typeorm';
import myDataSource from '../../../../../../../db/data-source';
import { Cache } from 'cache-manager';
import { table } from 'console';
import { QueueGroupTable } from '../../../models/businessTables/queueGroupTable.entity';
function getTablesOfQueueGroup(
  cacheManager: Cache,

  queueGroupId: number,
  dependencies: Dependencies = null,
) /* : Promise<IQueueGroupTable[]> */ {
  dependencies = injectDependencies(dependencies, ['db']);
  const queueGroupTableRepo = myDataSource.manager.getRepository(
    dependencies.db.models.queueGroupTable,
  );

  return queueGroupTableRepo.find({
    where: {
      queueGroup: { id: queueGroupId },
    },
    relations: ['areaQueueTables'],
  });
}

export async function createTables(
  cacheManager: Cache,

  tables: Partial<IQueueGroupTable>[],
  transactionParam: EntityManager = null,
  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  // creation of the tables
  // returning the result after creating everyting
  const queueGroupTableRepo = transactionParam.getRepository(
    dependencies.db.models.queueGroupTable,
  );
  const queueAreaTableRepo = transactionParam.getRepository(
    dependencies.db.models.queueAreaQueueTable,
  );
  const queueGroupRepo = transactionParam.getRepository(
    dependencies.db.models.queueGroup,
  );
  const newTables = await Promise.all(
    tables.map(async (table) => {
      const queueGroup = await queueGroupRepo.findOne({
        where: { id: Number(table.queueGroupId) },
      });

      return {
        queueGroup,
        capacity: table.capacity,
        minCapacity: table.minCapacity,
        areas: table.areas,
      };
    }),
  );
  const createdTables = await queueGroupTableRepo
    .createQueryBuilder()
    .insert()
    .into(QueueGroupTable)
    .values(newTables)
    .execute();

  // // creation of the association with areas

  const relations: { queueAreaId: number; queueGroupTableId: number }[] = [];

  tables.forEach((table, index) => {
    if ((table.areas || []).length > 0) {
      table.areas.forEach((areaId) => {
        relations.push({
          queueAreaId: areaId,
          queueGroupTableId: createdTables.generatedMaps[index].id,
        });
      });
    }
  });

  if (relations.length > 0) {
    await Promise.all(
      relations.map(async (data) => {
        const queueTable = transactionParam.getRepository(
          dependencies.db.models.queueAreaQueueTable,
        );
        const queueArea = transactionParam.getRepository(
          dependencies.db.models.queueArea,
        );
        const businessTable = transactionParam.getRepository(
          dependencies.db.models.queueGroupTable,
        );
        let area = await queueArea.findOne({ where: { id: data.queueAreaId } });
        let business = await businessTable.findOne({
          where: { id: data.queueGroupTableId },
        });
        const crating = await queueTable.create({
          queueArea: area,
          queueGroupTable: business,
        });
        await queueTable.save(crating);
        console.log(crating);
      }),
    );
  }
  // return getTablesOfQueueGroup(tables[0].queueGroupId);
}

export async function deleteTables(
  cacheManager: Cache,

  queueGroupId: number,
  tableIds: number[],
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  const queueGroupTableRepo = transaction.getRepository(
    dependencies.db.models.queueGroupTable,
  );

  // delete all previous relations between area - table
  await Promise.all(
    tableIds.map(async (tableId) => {
      await transaction
        .getRepository(dependencies.db.models.queueAreaQueueTable)
        .delete({
          queueGroupTable: {
            id: tableId,
          },
        });
    }),
  );
  // delete all  tables
  await Promise.all(
    tableIds.map(async (tableId) => {
      await queueGroupTableRepo.delete({
        id: tableId,

        queueGroup: { id: queueGroupId },
      });
    }),
  );
}

export async function updateTable(
  cacheManager: Cache,

  queueGroupId: number,
  tables: Partial<IQueueGroupTable>[],
  transactionParam: EntityManager = null,
  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  const queueGroupTableRepo = transactionParam.getRepository(
    dependencies.db.models.queueGroupTable,
  );

  await ensureTransaction(
    transactionParam,
    async (transaction) => {
      await Promise.all(
        tables.map(async (table) => {
          await queueGroupTableRepo.update(
            { id: table.id, queueGroup: { id: queueGroupId } },
            { capacity: table.capacity },
          );
        }),
      );

      // update of relations , areas: table.areas
      const relations: { queueAreaId: number; queueGroupTableId: number }[] =
        [];
      tables.forEach((table) => {
        if ((table.areas || []).length > 0) {
          table.areas.forEach((areaId) => {
            relations.push({
              queueAreaId: areaId,
              queueGroupTableId: table.id,
            });
          });
        }
      });

      // delete all previous relations
      await Promise.all(
        tables.map(async (table) => {
          await transactionParam
            .getRepository(dependencies.db.models.queueAreaQueueTable)
            .delete({
              queueGroupTable: {
                id: table.id,
              },
            });
        }),
      );

      if (relations.length > 0) {
        // create new relations
        await Promise.all(
          relations.map((data) =>
            transactionParam
              .getRepository(dependencies.db.models.queueAreaQueueTable)
              .create({
                queueArea: { id: data.queueAreaId },

                queueGroupTable: {
                  id: data.queueGroupTableId,
                },
              }),
          ),
        );
      }
    },
    dependencies,
  );
}

export default {
  getTablesOfQueueGroup,
  createTables,
  deleteTables,
  updateTable,
};
