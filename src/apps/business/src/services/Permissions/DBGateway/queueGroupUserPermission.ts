import {
  Dependencies,
  injectDependencies,
} from '../../../../../util/dependencyInjector';

import { IPermission } from '../../../../../types/queueGroupUserPermission';
import { DeepPartial, EntityManager } from 'typeorm';
import { BusinessPermissionEntity } from '../../../../../business/src/models/Permissions/permission.entity';
import myDataSource from '../../../../../../../db/data-source';
import { Cache } from 'cache-manager';
export function getQueueGroupsUserPermissions(
  cacheManager: Cache,

  userEmail: string,
  dependencies: Dependencies = null,
) /* : Promise<IPermission[]> */ {
  dependencies = injectDependencies(dependencies, ['db']);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const permRepo = myDataSource.getRepository(
    dependencies.db.models.queueGroupUserPermission,
  );
  return permRepo.find({
    where: { user: { email: userEmail.toLowerCase().trim() } },
  });
}
type permissionInput = {
  userEmail: string;
  queueGroupId: number;
} & DeepPartial<BusinessPermissionEntity>;
export async function createQueueGroupUserPermission(
  cacheManager: Cache,

  permission: Partial<IPermission>,
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  const permRepo = transaction.getRepository(
    dependencies.db.models.queueGroupUserPermission,
  );
  const userRepo = transaction.getRepository(dependencies.db.models.user);
  const businessRep = transaction.getRepository(
    dependencies.db.models.queueGroup,
  );
  const user = await userRepo.findOne({
    where: {
      email: permission.userEmail.trim().toLowerCase(),
    },
  });
  const business = await businessRep.findOne({
    where: {
      id: Number(permission.queueGroupId),
    },
  });
  const newpermission = await permRepo.create({
    user,
    queueGroup: business,
    ...permission,
  });
  await permRepo.save(newpermission);
}

export async function createQueueGroupUserPermissions(
  cacheManager: Cache,

  permissions: Partial<IPermission>[],
  transaction: EntityManager,
  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  const permRepo = transaction.getRepository(
    dependencies.db.models.queueGroupUserPermission,
  );

  await permRepo.insert(permissions);
}

export function getQueueGroupPermissions(
  cacheManager: Cache,

  queueGroupId: string,
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
): Promise<IPermission[]> {
  dependencies = injectDependencies(dependencies, ['db']);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const permRepo = transaction.getRepository(
    dependencies.db.models.queueGroupUserPermission,
  );

  return permRepo.find({
    where: { id: Number(queueGroupId) },
  });
}

export async function destroyQueueGroupPermissions(
  cacheManager: Cache,

  queueGroupId: string,
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  const permRepo = transaction.getRepository(
    dependencies.db.models.queueGroupUserPermission,
  );

  await permRepo.delete({
    id: Number(queueGroupId),
  });
}

export async function getQueueGroupPermissionOfUser(
  cacheManager: Cache,

  queueGroupId: string,
  userEmail: string,
  dependencies: Dependencies = null,
): Promise<IPermission> {
  dependencies = injectDependencies(dependencies, ['db']);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const permRepo = myDataSource.getRepository(
    dependencies.db.models.queueGroupUserPermission,
  );
  let data = await permRepo.findOne({
    where: {
      queueGroup: { id: Number(queueGroupId) },
      user: { email: userEmail },
    },
  });
  return data;
}

export default {
  getQueueGroupsUserPermissions,
  createQueueGroupUserPermission,
  createQueueGroupUserPermissions,
  getQueueGroupPermissions,
  destroyQueueGroupPermissions,
  getQueueGroupPermissionOfUser,
};
