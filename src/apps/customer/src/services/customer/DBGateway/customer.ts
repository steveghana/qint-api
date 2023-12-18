import {
  Dependencies,
  injectDependencies,
} from '../../../../../util/dependencyInjector';
import { ICustomer } from '../../../../../types/customer';
import { EntityManager } from 'typeorm';
// import { RedisCacheService } from '@/apps/redis/redis.service';
import myDataSource from '../../../../../../../db/data-source';
import { Cache } from 'cache-manager';
import uuid from '../../../../../../apps/util/uuid';

export async function getCustomerById(
  cacheManager: Cache,

  customerId: string,
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
): Promise<ICustomer> {
  dependencies = injectDependencies(dependencies, ['db']);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  // const key = `customer_by_id:${customerId}`;

  const data = await myDataSource.manager
    .getRepository(dependencies.db.models.customer)
    .findOne({
      where: {
        id: customerId,
      },
    });

  return data;
}

export async function getCustomerByPhone(
  cacheManager: Cache,

  customerPhone: string,
  transaction: EntityManager = null,

  dependencies: Dependencies = null,
): Promise<ICustomer> {
  dependencies = injectDependencies(dependencies, ['db']);
  // const cache = dependencies.db.cache;
  // const key = `customer_by_phone:${customerPhone}`;

  const customerRepo = myDataSource.manager.getRepository(
    dependencies.db.models.customer,
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const data = await customerRepo.findOne({
    where: {
      phone: customerPhone,
    },
  });

  return data;
}

export async function createCustomer(
  cacheManager: Cache,

  customer: Partial<ICustomer>,
  transaction: EntityManager = null,

  dependencies: Dependencies = null,
) /* : Promise<ICustomer>  */ {
  dependencies = injectDependencies(dependencies, ['db']);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const customerRepo = transaction.getRepository(
    dependencies.db.models.customer,
  );

  // Generate a UUID for the id field
  const id = uuid.makeUuid();

  const createdCustomer = await customerRepo.create({
    ...customer,
    id,
  });
  await customerRepo.save(createdCustomer);

  return createdCustomer;
}

export async function updateCustomer(
  cacheManager: Cache,

  customerId: string,
  updateObj: Partial<ICustomer>,
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  const customerRepo = myDataSource.manager.getRepository(
    dependencies.db.models.customer,
  );

  await customerRepo.update(
    {
      id: customerId,
    },
    { ...updateObj },
  );
  // dependencies.db.cache.del(`customer_by_id:${customerId}`);
  // dependencies.db.cache.del(`customer_by_phone:${updateObj.phone}`);
}

export async function findOrCreateCustomerByPhone(
  cacheManager: Cache,

  phone: string,
  defaults: Partial<ICustomer>,
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
): Promise<[ICustomer, boolean]> {
  dependencies = injectDependencies(dependencies, ['db']);
  const customerRepo = myDataSource.manager.getRepository(
    dependencies.db.models.customer,
  );

  const cache = dependencies.db.cache;
  const cacheKey = `customer_by_phone:${phone}`;
  let customer: ICustomer = null;

  customer = await customerRepo.findOne({
    where: {
      phone,
    },
  });

  // If customer not found in database, create new customer
  if (!customer) {
    customer = customerRepo.create({ phone, ...defaults });

    customer = await customerRepo.save(customer);

    return [customer, true];
  }

  return [customer, false];
}

export default {
  getCustomerById,
  getCustomerByPhone,
  createCustomer,
  updateCustomer,
  findOrCreateCustomerByPhone,
};
