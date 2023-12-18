import {
  Dependencies,
  injectDependencies,
} from '../../../../../util/dependencyInjector';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  Next,
} from '@nestjs/common';

import { IQueue } from '../../../../../types/queue';
import { IQueueGroup } from '../../../../../types/queueGroup';
import { IPermission } from '../../../../../types/queueGroupUserPermission';
import { In, UpdateResult } from 'typeorm';
import { BusinessEntity } from '../../../models/business.entity';
import { EntityManager } from 'typeorm';
// import { RedisCacheService } from '@/apps/redis/redis.service';
import myDataSource from '../../../../../../../db/data-source';
import { Cache } from 'cache-manager';
export async function getQueueGroupByEmail(
  cacheManager: Cache,

  userEmail: string,
  dependencies: Dependencies = null,
): Promise<IQueueGroup & { queue: IQueue; permissions: IPermission[] }> {
  dependencies = injectDependencies(dependencies, ['db']);
  const businessRepo = myDataSource.manager.getRepository(
    dependencies.db.models.queueGroup,
  );
  // const cache = dependencies.db.cache;
  // const cacheKey = `getQueueGroupByEmail:${userEmail}`;
  const data = await businessRepo.findOne({
    where: {
      //@ts-ignore
      permissions: {
        user: { email: userEmail },
      },
    },
    relations: ['queues', 'permissions'],
  });

  return data as unknown as IQueueGroup & {
    queue: IQueue;
    permissions: IPermission[];
  };
}

export async function getAllQueueGroup(
  cacheManager: Cache,

  dependencies: Dependencies = null,
): Promise<IQueueGroup & { queue: IQueue; permissions: IPermission[] }[]> {
  dependencies = injectDependencies(dependencies, ['db']);
  const businessRepo = myDataSource.manager.getRepository(
    dependencies.db.models.queueGroup,
  );

  const cache = dependencies.db.cache;
  const cacheKey = 'getAllQueueGroup';

  const data = await businessRepo.find({
    relations: ['queues', 'permissions'],
  });

  return data as unknown as IQueueGroup &
    { queue: IQueue; permissions: IPermission[] }[];
}

export async function setQueueGroupsNames(
  cacheManager: Cache,

  queueGroupIds: string[],
  name: string,
  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  const businessRepo = myDataSource.getRepository(
    dependencies.db.models.queueGroup,
  );

  const cache = dependencies.db.cache;
  await businessRepo.update(queueGroupIds, {
    name,
  });
  // const cacheKeys = queueGroupIds.map((id) => `queueGroup:${id}`);
  // await cache.del(cacheKeys);
  // await cache.del('getAllQueueGroup');
}

export async function createQueueGroup(
  cacheManager: Cache,

  queueGroup: Partial<IQueueGroup> & { name: string },
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
): Promise<BusinessEntity> {
  dependencies = injectDependencies(dependencies, ['db']);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  // const cache = dependencies.db.cache;
  const businessRepo = transaction.getRepository(
    dependencies.db.models.queueGroup,
  );
  //@ts-ignore
  const newQueueGroup = businessRepo.create({ ...queueGroup });
  await businessRepo.save(newQueueGroup);
  return newQueueGroup;
}

export async function getQueueGroup(
  cacheManager: Cache,

  queueGroupId: string,
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
): Promise<IQueueGroup & { queues: IQueue[]; permissions: IPermission[] }> {
  dependencies = injectDependencies(dependencies, ['db']);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return

  const cache = dependencies.db.cache;
  const businessRepo = transaction.getRepository(
    dependencies.db.models.queueGroup,
  );

  const cacheKey = `queueGroup:${queueGroupId}`;

  const data = await businessRepo.findOne({
    where: {
      id: Number(queueGroupId),
    },
    relations: ['queues', 'permissions'],
  });
  return data as unknown as IQueueGroup & {
    queues: IQueue[];
    permissions: IPermission[];
  };
}

export async function updateQueueGroup(
  cacheManager: Cache,

  queueGroupId: string,
  updateObj: Partial<IQueueGroup>,
  dependencies: Dependencies = null,
): Promise<[UpdateResult]> {
  dependencies = injectDependencies(dependencies, ['db']);
  const cache = dependencies.db.cache;
  const businessRepo = myDataSource.getRepository(
    dependencies.db.models.queueGroup,
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const s = await businessRepo.update(
    { id: Number(queueGroupId) },
    {
      ...updateObj,
      // queues
    },
  );
  // ToDO: Invalidate the cache entry for the corresponding email

  // if (queueGroup && queueGroup.permissions && queueGroup.permissions[0]) {
  //   const permission = queueGroup.permissions.find(
  //     (p) => p.userEmail === email,
  //   );
  //   const cacheKey = `getQueueGroupByEmail:${permission.userEmail}`;
  //   await cache.del(cacheKey);
  // }
  // await cache.del(`queueGroup:${queueGroupId}`);

  return [s];
}

export default {
  getQueueGroupByEmail,
  setQueueGroupsNames,
  createQueueGroup,
  getQueueGroup,
  updateQueueGroup,
};
