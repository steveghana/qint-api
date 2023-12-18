import {
  injectDependencies,
  Dependencies,
} from '../../../../../util/dependencyInjector';
import areaEntityGateway from '../DBGateway/area';
import { IQueueArea } from '../../../../../types/queueArea';
import { IQueueAreaTrait } from '../../../../../types/queueAreaTrait';
import { IQueueGroupTable } from '../../../../../types/queueGroupTable';
import { EntityManager } from 'typeorm';
import { Cache } from 'cache-manager';
class Area {
  private data?: any = null;

  constructor(data: any) {
    this.data = data;
  }

  static async ofQueueGroup(
    cacheManager: Cache,
    transaction: EntityManager,
    queueGroupId: string,
    dependencies: Dependencies = null,
  ): Promise<Area[]> {
    dependencies = injectDependencies(dependencies, ['db']);
    const areas = await areaEntityGateway.getAreasOfQueueGroup(
      transaction,
      cacheManager,
      queueGroupId,
      dependencies,
    );

    return areas
      ? areas.map((area) => new Area({ ...area, tables: area.tables.flat() }))
      : [];
  }

  static async create(
    cacheManager: Cache,
    areas: Partial<IQueueArea>[],
    transaction: EntityManager = null,
    dependencies: Dependencies = null,
  ): Promise<void> {
    dependencies = injectDependencies(dependencies, ['db']);
    await areaEntityGateway.createAreas(
      cacheManager,
      areas,
      transaction,

      dependencies,
    );
  }

  static async destroy(
    cacheManager: Cache,
    queueGroupId: string,
    areaIds: number[],
    transaction: EntityManager = null,
    dependencies: Dependencies = null,
  ): Promise<void> {
    dependencies = injectDependencies(dependencies, ['db']);
    await areaEntityGateway.deleteAreas(
      cacheManager,
      queueGroupId,
      areaIds,
      transaction,

      dependencies,
    );
  }

  static async update(
    cacheManager: Cache,
    queueGroupId: string,
    areas: Partial<IQueueArea>[],
    transaction: EntityManager = null,
    dependencies: Dependencies = null,
  ): Promise<void> {
    dependencies = injectDependencies(dependencies, ['db']);
    await areaEntityGateway.updateArea(
      cacheManager,
      Number(queueGroupId),
      areas,
      transaction,

      dependencies,
    );
  }

  get id(): number {
    return this.data && this.data.id;
  }

  get name(): { english: string; hebrew: string } {
    return this.data && this.data.name;
  }

  get queueGroupId(): string {
    return this.data && String(this.data.queueGroupId);
  }

  get traits(): IQueueAreaTrait[] {
    return this.data && this.data.traits;
  }

  get tables(): IQueueGroupTable[] {
    let tables: IQueueGroupTable[] = [];

    if (this.data && this.data.queueAreaQueueTable) {
      tables = this.data.queueAreaQueueTable.map(
        (areaTable) => areaTable.queueGroupTable,
      );
    }
    return tables;
  }
}

export default Area;
