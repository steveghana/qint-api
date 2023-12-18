// import { IQueue } from '@/apps/types/queue';
// import { IQueueGroup, IQueueGroupType } from '@/apps/types/queueGroup';
// import { IPermission } from '@/apps/types/queueGroupUserPermission';
// import {
//   createQueueGroup,
//   getQueueGroup,
//   getQueueGroupByEmail,
//   setQueueGroupsNames,
//   updateQueueGroup,
//   getAllQueueGroup,
// } from '../DBGateway/queueGroupEntityGateway';
// import {
//   Dependencies,
//   injectDependencies,
// } from '../../../../../util/dependencyInjector';
// import { UpdateResult } from 'typeorm';
// import { EntityManager } from 'typeorm';
// import { Cache } from "cache-manager";

// class QueueGroup {
//   private data: IQueueGroup = null;

//   private constructor(data: IQueueGroup) {
//     this.data = data;
//   }

//   static async getById(
//     cacheManager: Cache,

//     queueGroupId: string,
//     transaction: EntityManager = null,
//     dependencies: Dependencies = null,
//   ): Promise<QueueGroup> {
//     dependencies = injectDependencies(dependencies, ['db']);
//     const data = await getQueueGroup(cacheManager, queueGroupId, transaction, dependencies);
//     if (!data) {
//       return null;
//     }
//     return new QueueGroup(data);
//   }

//   static async getAll(cacheManager: Cache, dependencies: Dependencies = null): Promise<any[]> {
//     dependencies = injectDependencies(dependencies, ['db']);
//     const data = await getAllQueueGroup(cacheManager,dependencies);
//     if (!data) {
//       return null;
//     }
//     return data;
//   }

//   static async getByEmail(
//     cacheManager: Cache,

//     email: string,
//     dependencies: Dependencies = null,
//   ): Promise<QueueGroup> {
//     dependencies = injectDependencies(dependencies, ['db']);
//     const data = await getQueueGroupByEmail(cacheManager,email, dependencies);
//     if (!data) {
//       return null;
//     }
//     return new QueueGroup(data);
//   }

//   static async create(
//     cacheManager: Cache,

//     data: Partial<IQueueGroup> & { name: string },
//     transaction: EntityManager = null,
//     dependencies: Dependencies = null,
//   ): Promise<QueueGroup> {
//     dependencies = injectDependencies(dependencies, ['db']);
//     const item = await createQueueGroup(cacheManager,data, transaction, dependencies);
//     return item as unknown as QueueGroup;
//   }

//   static async setNameOfAllWithIds(
//     cacheManager: Cache,

//     queueGroupIds: string[],
//     name: string,
//     dependencies: Dependencies = null,
//   ): Promise<void> {
//     dependencies = injectDependencies(dependencies, ['db']);
//     await setQueueGroupsNames(cacheManager,queueGroupIds, name, dependencies);
//   }

//   static async update(
//     cacheManager: Cache,

//     queueGroupId: string,
//     data: Partial<IQueueGroup>,
//     dependencies: Dependencies = null,
//   ): Promise<[UpdateResult]> {
//     const [affectedRows] = await updateQueueGroup(
//       cacheManager,
//       queueGroupId,
//       data,
//       dependencies,
//     );
//     return [affectedRows];
//   }

//   get id(): string {
//     return this.data && String(this.data.id);
//   }

//   get name(): string {
//     return this.data && this.data.name;
//   }

//   get logoUrl(): string {
//     return this.data && this.data.logoUrl;
//   }
//   get phone(): string {
//     return this.data && this.data.phone;
//   }
//   get geometryLat(): number {
//     return this.data && this.data.geometryLat;
//   }
//   get geometryLong(): number {
//     return this.data && this.data.geometryLong;
//   }
//   get centerLat(): number {
//     return this.data && this.data.centerLat;
//   }
//   get centerLong(): number {
//     return this.data && this.data.centerLong;
//   }
//   get type(): IQueueGroupType {
//     return this.data && this.data.type;
//   }
//   get queues(): IQueue[] {
//     return this.data && this.data.queues;
//   }

//   get permissions(): IPermission[] {
//     return this.data && this.data.permissions;
//   }

//   get countryCode(): number {
//     return this.data && this.data.countryCode;
//   }
//   get address(): string {
//     return this.data && this.data.address;
//   }
// }

// export default QueueGroup;
