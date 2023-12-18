// import { ResultBoundary } from '..';
import {
  Dependencies,
  injectDependencies,
} from '../../../../../util/dependencyInjector';
import { IQueueGroup } from '../../../../../types/queueGroup';
import { useTransaction } from '../../../../../Config/transaction';
// import from '../../entityGateway/transaction';
import QueueGroupUserPermission from '../../Permissions/Entity/queueGroupUserPermission';

import QueueGroup from '../Entity/queueGroup';
import { getAllQueueGroup } from '../DBGateway/queueGroupEntityGateway';
// import QueueArea from '@/apps/business/src/models/Area/queueArea.entity';
import Area from '../../Area/Entity/area';
import { IQueueArea } from '../../../../../types/queueArea';

import { IQueueGroupTable } from '../../../../../types/queueGroupTable';
import Table from '../../Table/Entity/queueGroupTable';
import {
  BadRequestException,
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Next,
} from '@nestjs/common';
import { RedisCacheService } from '../../../../../redis/redis.service';
import { Cache } from 'cache-manager';
type GetQueueGroupByEmailFailureReason = "doesn't exist";

@Injectable()
export class BusinessService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  ofQueueGroup;
  async getQueueGroupByEmail(
    email: string,
    dependencies: Dependencies = null,
  ) /* Promise<GetQueueGroupByEmailSuccess | GetQueueGroupByEmailFailure> */ {
    dependencies = injectDependencies(dependencies, ['db']);
    return useTransaction(async (transaction) => {
      const queueGroup = await QueueGroup.getByEmail(
        email,
        this.cacheManager,
        dependencies,
      );
      // this.cacheManager
      if (!queueGroup) {
        new HttpException("doesn't exist", HttpStatus.BAD_REQUEST);
        return;
      }
      return {
        id: queueGroup.id,
        name: queueGroup.name,
        countryCode: queueGroup.countryCode,
        logoUrl: queueGroup.logoUrl,
        phone: queueGroup.phone,
        address: queueGroup.address,
        centerLat: queueGroup.centerLat,
        centerLong: queueGroup.centerLong,
        geometryLat: queueGroup.geometryLat,
        geometryLong: queueGroup.geometryLong,
        type: queueGroup.type,
        queues: queueGroup.queues,
        permissions: queueGroup.permissions,
      };
    }, dependencies);
  }

  async getallQueueGroup(
    dependencies: Dependencies = null,
  ) /* Promise<GetQueueGroupSuccess | GetQueueGroupFailure> */ {
    dependencies = injectDependencies(dependencies, ['db']);
    return useTransaction(async (transaction) => {
      const queueGroup = await getAllQueueGroup(
        this.cacheManager,
        dependencies,
      );

      if (!queueGroup) {
        throw new HttpException("doesn't exist", HttpStatus.BAD_REQUEST);
      }
      return queueGroup as unknown as IQueueGroup[];
    }, dependencies);
  }

  async setQueueGroupNameByEmail(
    email: string,
    name: string,
    dependencies: Dependencies = null,
  ) /* Promise<SetQueueGroupNameByEmailSuccess | SetQueueGroupNameByEmailFailure> */ {
    dependencies = injectDependencies(dependencies, ['db']);
    const key = `queueGroup:${email}`;

    return useTransaction(async (transaction) => {
      const permissions = await QueueGroupUserPermission.ofUser(
        this.cacheManager,
        email,
        dependencies,
      );
      const queueGroupIds = permissions.map(
        (permission: { queueGroupId: string }) => permission.queueGroupId,
      );
      if (queueGroupIds.length === 0) {
        throw new HttpException("doesn't exist", HttpStatus.BAD_REQUEST);
      }
      await QueueGroup.setNameOfAllWithIds(
        this.cacheManager,
        queueGroupIds,
        name,
        dependencies,
      );
    }, dependencies);

    // return new SetQueueGroupNameByEmailSuccess();
  }

  createQueueGroup(
    name: string,
    ownerEmail: string,
    phone: string,
    dependencies: Dependencies = null,
  ) /* Promise<CreateQueueGroupSuccess | CreateQueueGroupFailure> */ {
    dependencies = injectDependencies(dependencies, ['db']);

    return useTransaction(async (transaction) => {
      const queueGroup = await QueueGroup.create(
        this.cacheManager,
        { name, phone },
        transaction,
        dependencies,
      );

      await QueueGroupUserPermission.create(
        this.cacheManager,
        {
          isOwner: true,
          userEmail: ownerEmail,
          queueGroupId: Number(queueGroup.id),
        },
        transaction,
        dependencies,
      );

      return queueGroup.id;
    }, dependencies);
  }

  async getQueueGroupById(
    id: string,
    dependencies: Dependencies = null,
  ) /* Promise<GetQueueGroupByIdSuccess | GetQueueGroupByIdFailure> */ {
    dependencies = injectDependencies(dependencies, ['db']);
    return useTransaction(async (transaction) => {
      const queueGroup = await QueueGroup.getById(
        this.cacheManager,
        id,
        transaction,
        dependencies,
      );

      if (!queueGroup) {
        throw new HttpException('Not found', HttpStatus.BAD_REQUEST);
      }
      return {
        id: queueGroup.id,
        name: queueGroup.name,
        logoUrl: queueGroup.logoUrl,
        phone: queueGroup.phone,
        type: queueGroup.type,
        address: queueGroup.address,
        queues: queueGroup.queues,
        permissions: queueGroup.permissions,
      };
    }, dependencies);
  }

  async patchQueueGroup(
    requestingUserEmail: string,
    queueGroupId: string,
    updateObj: Partial<IQueueGroup>,
    dependencies: Dependencies = null,
  ) /* Promise<PatchQueueGroupSuccess | PatchQueueGroupFailure> */ {
    dependencies = injectDependencies(dependencies, ['db']);
    return useTransaction(async (transaction) => {
      const permission = await QueueGroupUserPermission.ofUserInQueueGroup(
        this.cacheManager,
        queueGroupId,
        requestingUserEmail,
        dependencies,
      );
      if (!permission || !permission.isOwner) {
        throw new BadRequestException();
      }

      const [affectedRows] = await QueueGroup.update(
        this.cacheManager,
        queueGroupId,
        requestingUserEmail,
        updateObj,
        dependencies,
      );
      //@ts-ignore
      if (affectedRows === 0) {
        throw new BadRequestException();
      }

      // return new PatchQueueGroupSuccess();
    }, dependencies);
  }

  async getQueueGroupAreas(
    queueGroupId: string,
    dependencies: Dependencies = null,
  ) /* Promise<GetQueueGroupAreasSuccess | GetQueueGroupAreasFailure> */ {
    type s = IQueueArea;
    dependencies = injectDependencies(dependencies, ['db']);
    return useTransaction(async (transaction) => {
      const areas = await Area.ofQueueGroup(
        this.cacheManager,
        transaction,
        queueGroupId,
        dependencies,
      );

      return areas.map((area) => ({
        id: area.id,
        name: area.name,
        traits: area.traits,
        queueGroupId: queueGroupId,
        tables: area.tables,
      }));
    }, dependencies);
  }

  async patchQueueGroupArea(
    requestingUserEmail: string,
    queueGroupId: string,
    deleteObj: number[],
    addObj: Partial<IQueueArea>[],
    updateObj: Partial<IQueueArea>[],
    dependencies: Dependencies = null,
  ) /* Promise<PatchQueueGroupAreaSuccess | PatchQueueGroupAreaFailure> */ {
    dependencies = injectDependencies(dependencies, ['db']);

    const permission = await QueueGroupUserPermission.ofUserInQueueGroup(
      this.cacheManager,
      queueGroupId,
      requestingUserEmail,
      dependencies,
    );
    if (!permission) {
      return new BadRequestException();
    }

    return useTransaction(async (transaction) => {
      if (deleteObj?.length) {
        await Area.destroy(
          this.cacheManager,
          queueGroupId,
          deleteObj,
          transaction,
          dependencies,
        );
      }
      if (addObj?.length) {
        await Area.create(
          this.cacheManager,
          addObj.map((area) => ({
            ...area,
            queueGroupId: Number(queueGroupId),
          })),
          transaction,
          dependencies,
        );
      }
      if (updateObj?.length) {
        await Area.update(
          this.cacheManager,
          queueGroupId,
          updateObj.map((obj) => ({
            ...obj,
            queueGroupId: Number(queueGroupId),
          })),
          transaction,
          dependencies,
        );
      }
      // return new PatchQueueGroupAreaSuccess();
    }, dependencies);
  }

  /** Handling Patching of queueGroup tables */

  async getQueueGroupTables(
    queueGroupId: string,
    dependencies: Dependencies = null,
  ) /* Promise<GetQueueGroupTablesSuccess | GetQueueGroupTablesFailure> */ {
    dependencies = injectDependencies(dependencies, ['db']);

    const tables = await Table.ofQueueGroup(
      this.cacheManager,
      queueGroupId,
      dependencies,
    );

    return tables;
  }

  async patchQueueGroupTable(
    requestingUserEmail: string,
    queueGroupId: string,
    deleteObj: number[],
    addObj: Partial<IQueueGroupTable>[],
    updateObj: Partial<IQueueGroupTable>[],
    dependencies: Dependencies = null,
  ) /* Promise<PatchQueueGroupTableSuccess | PatchQueueGroupTableFailure> */ {
    dependencies = injectDependencies(dependencies, ['db']);

    //console.log('inside interactor : patchQueueGroupTable');

    const permission = await QueueGroupUserPermission.ofUserInQueueGroup(
      this.cacheManager,
      queueGroupId,
      requestingUserEmail,
      dependencies,
    );
    if (!permission) {
      return new BadRequestException();
    }

    return useTransaction(async (transaction) => {
      if (deleteObj.length > 0) {
        await Table.destroy(
          this.cacheManager,
          queueGroupId,
          deleteObj,
          transaction,
          dependencies,
        );
      }

      // creation of tables
      if (addObj.length > 0) {
        await Table.create(
          this.cacheManager,
          addObj.map((table) => ({ ...table, queueGroupId: queueGroupId })),
          transaction,
          dependencies,
        );
      }

      //update of tables
      if (updateObj.length > 0) {
        await Table.update(
          this.cacheManager,
          queueGroupId,
          updateObj.map((obj) => ({ ...obj, queueGroupId: queueGroupId })),
          transaction,
          dependencies,
        );
      }
      // return new PatchQueueGroupTableSuccess();
    }, dependencies);
  }
}
