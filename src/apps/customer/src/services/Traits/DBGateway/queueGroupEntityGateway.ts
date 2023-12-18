// import {
//   Dependencies,
//   injectDependencies,
// } from '../../../../../util/dependencyInjector';
// import { IQueue } from '@/apps/types/queue';
// import { IQueueGroup } from '@/apps/types/queueGroup';
// import { IPermission } from '@/apps/types/queueGroupUserPermission';
// import { In, UpdateResult } from 'typeorm';
// import BusinessEntity from '@/apps/business/src/models/business.entity';
// import { EntityManager } from 'typeorm';
// import { Cache } from "cache-manager";
// import myDataSource from '../../../../../../../db/data-source';

// export async function getQueueGroupByEmail(
//   cacheManager:Cache,
//   userEmail: string,
//   dependencies: Dependencies = null,
// ): Promise<IQueueGroup & { queue: IQueue; permissions: IPermission[] }> {
//   dependencies = injectDependencies(dependencies, ['db']);
//   // eslint-disable-next-line @typescript-eslint/no-unsafe-return
//   // myDataSource.manager.getRepository()
//   const data = await dependencies.db.models.queueGroup.findOne({
//     relations: ['queue', 'permissions'],
//     where: {
//       permissions:{
//         user:{email: userEmail.toLocaleLowerCase().trim()}
//       }
//     },
//   });
//   return data as unknown as IQueueGroup & {
//     queue: IQueue;
//     permissions: IPermission[];
//   };
// }
// export async function getAllQueueGroup(
//   cacheManager:Cache,
//   dependencies: Dependencies = null,
// ): Promise<IQueueGroup & { queue: IQueue; permissions: IPermission[] }[]> {
//   dependencies = injectDependencies(dependencies, ['db']);
//   // eslint-disable-next-line @typescript-eslint/no-unsafe-return
//   const data = await dependencies.db.models.queueGroup.find({
//     relations: ['queue', 'permissions'],
//   });
//   return data as unknown as IQueueGroup &
//     { queue: IQueue; permissions: IPermission[] }[];
// }

// export async function setQueueGroupsNames(
//   cacheManager:Cache,
//   queueGroupIds: string[],
//   name: string,
//   dependencies: Dependencies = null,
// ): Promise<void> {
//   dependencies = injectDependencies(dependencies, ['db']);
//   await dependencies.db.models.queueGroup.update(queueGroupIds, {
//     name,
//   });
// }

// export async function createQueueGroup(
//   cacheManager:Cache,
//   queueGroup: Partial<IQueueGroup> & { name: string },
//   transaction: EntityManager = null,
//   dependencies: Dependencies = null,
// ): Promise<BusinessEntity> {
//   console.log(queueGroup, 'entitygateway, createqueuegroup');
//   dependencies = injectDependencies(dependencies, ['db']);
//   // eslint-disable-next-line @typescript-eslint/no-unsafe-return
//   //@ts-ignore
//   return await transaction.getRepository(dependencies.db.models.queueGroup).create(queueGroup);
// }

// export async function getQueueGroup(
//   cacheManager:Cache,
//   queueGroupId: string,
//   transaction: EntityManager = null,
//   dependencies: Dependencies = null,
// ): Promise<IQueueGroup & { queues: IQueue[]; permissions: IPermission[] }> {
//   dependencies = injectDependencies(dependencies, ['db']);
//   // eslint-disable-next-line @typescript-eslint/no-unsafe-return
//   const data = await dependencies.db.models.queueGroup.findOne({
//     relations: ['queue', 'permissions'],
//     where: {
//       id: Number(queueGroupId),
//     },
//   });
//   return data as unknown as IQueueGroup & {
//     queues: IQueue[];
//     permissions: IPermission[];
//   };
// }

// export async function updateQueueGroup(
//   cacheManager:Cache,
//   queueGroupId: string,
//   updateObj: Partial<IQueueGroup>,
//   dependencies: Dependencies = null,
// ): Promise<[UpdateResult]> {
//   dependencies = injectDependencies(dependencies, ['db']);
//   // eslint-disable-next-line @typescript-eslint/no-unsafe-return
//   //@ts-ignore
//   const s = await dependencies.db.models.queueGroup.update(queueGroupId, {
//     ...updateObj,
//   });
//   return [s];
// }

// export default {
//   getQueueGroupByEmail,
//   setQueueGroupsNames,
//   createQueueGroup,
//   getQueueGroup,
//   updateQueueGroup,
// };
