import {
  Dependencies,
  injectDependencies,
} from '../../../../../util/dependencyInjector';
import {
  createQueueGroupUserPermission,
  createQueueGroupUserPermissions,
  destroyQueueGroupPermissions,
  getQueueGroupPermissionOfUser,
  getQueueGroupPermissions,
  getQueueGroupsUserPermissions,
} from '../DBGateway/queueGroupUserPermission';
import { EntityManager } from 'typeorm';
import { Cache } from "cache-manager";
import { IPermission } from '../../../../../types/queueGroupUserPermission';

class QueueGroupUserPermission {
  private data: IPermission = null;

  private constructor(data: IPermission) {
    this.data = data;
  }

  static async ofUserInQueueGroup(
    // transaction:EntityManager,
    cacheManager: Cache,
    queueGroupId: string,
    userEmail: string,
    dependencies: Dependencies = null,
  ): Promise<QueueGroupUserPermission> {
    dependencies = injectDependencies(dependencies, ['db']);
    const permission = await getQueueGroupPermissionOfUser(
      cacheManager,
      queueGroupId,
      userEmail,
      dependencies,
    );
    if (!permission) {
      return null;
    }
    const instance = new QueueGroupUserPermission(permission);
    return instance;
  }

  static async ofUser(
    cacheManager: Cache,
    userEmail: string,
    dependencies: Dependencies = null,
  ): Promise<QueueGroupUserPermission[]> {
    dependencies = injectDependencies(dependencies, ['db']);
    const permissions = await getQueueGroupsUserPermissions(
      cacheManager,
      userEmail,
      dependencies,
    );
    return permissions.map(
      (permission) => new QueueGroupUserPermission(permission),
    );
  }

  static async ofQueueGroup(
    cacheManager: Cache,
    queueGroupId: string,
    transaction: EntityManager = null,
    dependencies: Dependencies = null,
  ): Promise<QueueGroupUserPermission[]> {
    dependencies = injectDependencies(dependencies, ['db']);
    const permissions = await getQueueGroupPermissions(
      cacheManager,
      queueGroupId,
      transaction,
      dependencies,
    );
    return permissions.map(
      (permission) => new QueueGroupUserPermission(permission),
    );
  }

  static async create(
    cacheManager: Cache,
    permission: Partial<IPermission>,
    transaction: EntityManager = null,
    dependencies: Dependencies = null,
  ): Promise<void> {
    dependencies = injectDependencies(dependencies, ['db']);
    console.log('entered permission')

    await createQueueGroupUserPermission(cacheManager,permission, transaction, dependencies);
  }

  static async bulkCreate(
    cacheManager: Cache,
    permissions: Partial<IPermission>[],
    transaction: EntityManager = null,
    dependencies: Dependencies = null,
  ): Promise<void> {
    dependencies = injectDependencies(dependencies, ['db']);
    await createQueueGroupUserPermissions(cacheManager,permissions,transaction, dependencies);
  }

  static async destroyOfQueueGroup(
    cacheManager: Cache,
    queueGroupId: string,
    transaction: EntityManager = null,
    dependencies: Dependencies = null,
  ): Promise<void> {
    dependencies = injectDependencies(dependencies, ['db']);
    await destroyQueueGroupPermissions(cacheManager,queueGroupId, transaction, dependencies);
  }

  get isOwner(): boolean {
    return this.data && this.data.isOwner;
  }

  get canManageQueue(): boolean {
    return this.data && this.data.canManageQueue;
  }

  get canManagePermissions(): boolean {
    return this.data && this.data.canManagePermissions;
  }

  get userEmail(): string {
    return this.data && this.data.userEmail;
  }

  get queueGroupId(): string {
    return this.data && String(this.data.queueGroupId);
  }
}

export default QueueGroupUserPermission;
