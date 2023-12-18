import {
  injectDependencies,
  Dependencies,
} from '../../../../../util/dependencyInjector';
import tableEntityGateway from '../DBGateway/queueGroupTable';
import { IQueueGroupTable } from '../../../../../types/queueGroupTable';
import { EntityManager } from 'typeorm';
import { Cache } from "cache-manager";
class Table {
  private data?: IQueueGroupTable = null;

  constructor(data: IQueueGroupTable) {
    this.data = data;
  }

  static async ofQueueGroup(
    cacheManager: Cache,

    queueGroupId: string,
    dependencies: Dependencies = null,
  ): Promise<IQueueGroupTable[]> {
    dependencies = injectDependencies(dependencies, ['db']);
    const tables: any[] = await tableEntityGateway.getTablesOfQueueGroup(
      cacheManager,
      Number(queueGroupId),
      dependencies,
    );
    const data = tables.map((table) => {
      const refinedTable: IQueueGroupTable = {
        id: table.id,
        capacity: table.capacity,
        minCapacity: table.minCapacity,
        areas: (table.queueAreaQueueTables || []).map(
          (at: any) => at.queueAreaId as number,
        ),
      };
      return refinedTable;
    });
    //console.log('data --> ', JSON.stringify(data));

    return data;
  }

  static async create(
    cacheManager: Cache,

    tables: Partial<IQueueGroupTable>[],
    transaction: EntityManager = null,
    dependencies: Dependencies = null,
  ): Promise<void> {
    dependencies = injectDependencies(dependencies, ['db']);
    await tableEntityGateway.createTables(cacheManager,tables, transaction, dependencies);
  }

  static async destroy(
    cacheManager: Cache,
    queueGroupId: string,
    tableIds: number[],
    transaction: EntityManager = null,
    dependencies: Dependencies = null,
  ): Promise<void> {
    dependencies = injectDependencies(dependencies, ['db']);
    await tableEntityGateway.deleteTables(
      cacheManager,
      Number(queueGroupId),
      tableIds,
      transaction,
      dependencies,
    );
  }

  static async update(
    cacheManager: Cache,
    queueGroupId: string,
    tables: Partial<IQueueGroupTable>[],
    transaction: EntityManager = null,
    dependencies: Dependencies = null,
  ): Promise<void> {
    dependencies = injectDependencies(dependencies, ['db']);
    await tableEntityGateway.updateTable(
      cacheManager,
      Number(queueGroupId),
      tables,
      transaction,
      dependencies,
    );
  }

  get id(): number {
    return this.data && this.data.id;
  }

  get capacity(): number {
    return this.data && this.data.capacity;
  }

  get queueGroupId(): string {
    return this.data && this.data.queueGroupId;
  }
}

export default Table;
