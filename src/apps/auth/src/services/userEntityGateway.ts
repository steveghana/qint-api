import {
  Dependencies,
  injectDependencies,
} from '../../../util/dependencyInjector';
import { IUser } from '../models/user';
import { UserEntity } from '../models/user.entity';
import { DeepPartial, EntityManager, In } from 'typeorm';
import { ensureTransaction, useTransaction } from '../../../util/transaction';
import myDataSource from '../../../../../db/data-source';
export async function findOrCreateUser(
  email: string,
  defaults: IUser,
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
): Promise<[UserEntity, boolean]> {
  dependencies = injectDependencies(dependencies, ['db']);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return

  return ensureTransaction(
    transaction,
    async (transaction) => {
      const userRepo = transaction.getRepository(dependencies.db.models.user);
      const existingUser = await userRepo.findOne({
        where: { email: email.toLowerCase() },
      });
      if (existingUser) {
        return [existingUser, false];
      }
      const newUser = await userRepo.create({
        ...defaults,
      });
      await userRepo.save(newUser);
      return [newUser, true];
    },
    dependencies,
  );
}

// We are using findElseCreateUser instead of findOrCreateUser , since findOrCreateUser logs values openly
// Temp solution. Waiting for issue https://github.com/sequelize/sequelize/issues/14266 to be resolved
export function findElseCreateUser(
  email: string,
  user: IUser,
  transactionParam: EntityManager = null,
  dependencies: Dependencies = null,
): Promise<[UserEntity, boolean]> {
  dependencies = injectDependencies(dependencies, ['db']);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return

  return ensureTransaction(
    transactionParam,
    async (transaction) => {
      const userRepo = transaction.getRepository(dependencies.db.models.user);
      const existingUser = await userRepo.findOne({
        where: { email: email.toLowerCase() },
      });
      if (existingUser) {
        return [existingUser, false];
      }

      const newUser = userRepo.create({ ...user });
      let data = await userRepo.save(newUser);
      return [data, true];
    },
    dependencies,
  );
}

export async function getUser(
  email: string,

  dependencies: Dependencies = null,
): Promise<UserEntity> {
  dependencies = injectDependencies(dependencies, ['db']);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return useTransaction(async (transaction) => {
    const userRepo = transaction.getRepository(dependencies.db.models.user);
    let user = await userRepo.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });
    return user;
  }, dependencies);
}

export function getUsers(
  emails: string[],
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
): Promise<UserEntity[]> {
  dependencies = injectDependencies(dependencies, ['db']);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const userRepo = transaction.getRepository(dependencies.db.models.user);
  return userRepo.find({
    where: {
      email: In([emails]),
    },
  });
}

export async function createUsers(
  users: (Partial<IUser> & { email: string })[],
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  const userRepository = transaction.getRepository(UserEntity);
  await userRepository.insert(users);
}

export async function updateUser(
  user: Partial<IUser>,
  transaction: EntityManager,
  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const userRepo = transaction.getRepository(dependencies.db.models.user);
  await userRepo.update(
    { email: user?.email.trim().toLowerCase() },
    {
      ...user,
    },
  );
}

export default {
  findOrCreateUser,
  findElseCreateUser,
  getUser,
  getUsers,
  createUsers,
  updateUser,
};
