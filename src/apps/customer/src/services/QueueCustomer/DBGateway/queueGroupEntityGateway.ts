// import { Op, EntityManager } from 'sequelize';
import {
  Dependencies,
  injectDependencies,
} from '../../../../../util/dependencyInjector';
import {
  IQueueCustomer,
  QueueCustomerLeaveReasons,
} from '../../../../../types/queueCustomer';
import { ICustomer } from '../../../../../types/customer';
import { IQueue } from '../../../../../types/queue';
import { IQueueGroup } from '../../../../../types/queueGroup';
import { ensureTransaction } from '../../../../../util/transaction';
import { subMilliseconds } from 'date-fns';
import {
  IsNull,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from 'typeorm';
import { In } from 'typeorm';
import { QueueCustomerTraits } from '../../../../../customer/src/models/Traits/queueCustomerTrait.entity';
import { QueueArea } from '../../../../../business/src/models/Area/queueArea.entity';
import { EntityManager } from 'typeorm';
import { QueueCustomerEntity } from '../../../models/QueueCustomer/queueCustomer.entity';
import myDataSource from '../../../../../../../db/data-source';
import { Cache } from 'cache-manager';
import { QueueCustomerQueueArea } from '../../../models/Areas/queueCustomerQueueArea.entity';
import { IAdvertisement } from '@/apps/types/advertisement';
import { Cart } from '../../../models/CartItems/CartItem.entity';
import { CartItem } from '../../../models/CartItems/ProductQty.entity';

export async function getQueueArrayCustomersEnqueuedAfter(
  cacheManager: Cache,
  queueIds: string[],
  joinTime: Date,
  dependencies: Dependencies = null,
) /* : Promise<IQueueCustomer[]> */ {
  dependencies = injectDependencies(dependencies, ['db']);
  const queueCustomerRepo = myDataSource.manager.getRepository(
    dependencies.db.models.queueCustomer,
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-returnd

  const newQueueCustomer = await queueCustomerRepo.find({
    where: {
      queue: {
        id: In([Number(queueIds)]),
      },
      // joinTime: LessThanOrEqual(joinTime),
    },
    order: { joinTime: 'ASC' },
  });
  // await dependencies.db.cache.set(cacheKey, newQueueCustomer);
  return newQueueCustomer;
}

export async function getWaitingQueueCustomer(
  cacheManager: Cache,

  queueId: string,
  customerId: string,
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
): Promise<
  IQueueCustomer & {
    customer: ICustomer;
  }
> {
  dependencies = injectDependencies(dependencies, ['db']);
  const queueCustomerRepo = transaction.getRepository(
    dependencies.db.models.queueCustomer,
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  // const cache = dependencies.db.cache;
  // const cacheKey = `getWaitingQueueCustomer:${queueId}:${customerId}`;

  const data = await queueCustomerRepo.findOne({
    where: {
      queue: {
        id: Number(queueId),
      },
      leaveTime: IsNull(),
      customer: { id: customerId },
    },
    relations: ['customer'],
  });
  // await cache.set(cacheKey, data);
  return data as unknown as IQueueCustomer & {
    customer: ICustomer;
  };
}

export async function getWaitingQueueCustomers(
  cacheManager: Cache,

  queueId: string,
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
): Promise<(IQueueCustomer & { customer: ICustomer })[]> {
  dependencies = injectDependencies(dependencies, ['db']);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  // Generate a unique cache key based on the function arguments
  const queueCustomerRepo = myDataSource.manager.getRepository(
    dependencies.db.models.queueCustomer,
  );

  // const cacheKey = `getWaitingQueueCustomers:${queueId}`;
  // const cache = cacheManager;

  const data = await queueCustomerRepo.findOne({
    where: {
      queue: {
        id: Number(queueId),
      },
      leaveTime: IsNull(),
    },
    order: {
      number: 'ASC',
      id: 'ASC',
    },
    relations: ['customer', 'areas', 'areas.queueArea'],
  });
  // await cache.set(cacheKey, data);
  return data as unknown as (IQueueCustomer & { customer: ICustomer })[];
}

export async function getWaitingQueueCustomerByPhone(
  cacheManager: Cache,

  queueId: string,
  customerPhone: string,
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
) /* : Promise<IQueueCustomer & { customer: ICustomer }> */ {
  dependencies = injectDependencies(dependencies, ['db']);
  const cache = dependencies.db.cache;
  const queueCustomerRepo = transaction.getRepository(
    dependencies.db.models.queueCustomer,
  );

  // const cacheKey = `getWaitingQueueCustomerByPhone:${queueId}:${customerPhone}`;

  // Check the cache first

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const data = await queueCustomerRepo
    .createQueryBuilder('queueCustomer')
    .leftJoinAndSelect('queueCustomer.customer', 'customer')
    .where('queueCustomer.queueId = :queueId', { queueId })
    .andWhere('queueCustomer.leaveTime IS NULL')
    .andWhere('customer.phone = :phone', { phone: customerPhone })
    .getOne();
  // await cache.set(cacheKey, data);
  return data as unknown as IQueueCustomer & { customer: ICustomer };
}

export async function getQueueCustomersLeftAfterQueueReset(
  transaction: EntityManager,
  cacheManager: Cache,

  queueId: string,
  resetNumberTime: Date,
  customerNumber: number,
  dependencies: Dependencies = null,
) {
  dependencies = injectDependencies(dependencies, ['db']);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const queueCustomerRepo = myDataSource.getRepository(
    dependencies.db.models.queueCustomer,
  );

  // const cache = dependencies.db.cache;
  // const cacheKey = `getQueueCustomersLeftAfterQueueReset_${queueId}_${resetNumberTime}_${customerNumber}`;

  const data = queueCustomerRepo
    .createQueryBuilder('queueCustomer')
    .leftJoinAndSelect(
      'queueCustomer.customer',
      'customer',
      'customer.id = queueCustomer.customerId',
    )
    .leftJoinAndSelect('queueCustomer.traits', 'traits')
    .leftJoinAndSelect('queueCustomer.areas', 'areas')
    .leftJoinAndSelect('areas.queueArea', 'queueArea')
    // .leftJoinAndSelect('areas.area', 'area')
    .where('queueCustomer.queueId = :queueId', { queueId });

  if (customerNumber) {
    data.andWhere('queueCustomer.number = :customerNumber', { customerNumber });
  }

  if (resetNumberTime) {
    data
      .andWhere('queueCustomer.leaveTime IS NOT NULL')
      .andWhere('queueCustomer.leaveTime > :resetNumberTime', {
        resetNumberTime,
      });
  }

  const queueCustomers = await data
    .orderBy('queueCustomer.leaveTime', 'ASC')
    .getMany();

  // await cache.set(cacheKey, data);
  // console.log(queueCustomers, 'from getting queuecustomers')
  return queueCustomers;
}

export async function getPreviousQueueCustomerOfQueue(
  cacheManager: Cache,

  queueId: number,
  currentlyServedCustomerId: string,
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
) {
  dependencies = injectDependencies(dependencies, ['db']);
  const cache = dependencies.db.cache;
  const queueCustomerRepo = myDataSource.manager.getRepository(
    dependencies.db.models.queueCustomer,
  );

  // const cacheKey = `getPreviousQueueCustomerOfQueue_${queueId}_${currentlyServedCustomerId}`;
  // const cachedResult = (await cache.get(cacheKey)) as QueueCustomerEntity;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const data = await queueCustomerRepo.findOne({
    where: {
      queue: {
        id: Number(queueId),
      },
      leaveReason: 'served',
      id: Not(Number(currentlyServedCustomerId)),
    },
    order: {
      leaveTime: 'DESC',
    },
  });
  // await cache.set(cacheKey, data);
  return data;
}

export async function getCurrentQueueCustomerOfQueue(
  cacheManager: Cache,

  queueId: string,
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
) {
  dependencies = injectDependencies(dependencies, ['db']);
  const queueCustomerRepo = myDataSource.manager.getRepository(
    dependencies.db.models.queueCustomer,
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  // const cacheKey = `getCurrentQueueCustomerOfQueue:${queueId}`;
  // const cache = dependencies.db.cache;

  const data = await queueCustomerRepo.findOne({
    where: {
      queue: {
        id: Number(queueId),
      },
      leaveReason: 'served',
    },
    order: {
      leaveTime: 'DESC',
    },
    relations: ['customer'],
  });
  // await cache.set(cacheKey, data);
  return data as unknown as IQueueCustomer & { customer: ICustomer };
}

export async function setQueueCustomerNotifyUsingSms(
  cacheManager: Cache,

  queueCustomerId: string,
  notifyUsingSms: boolean,
  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  const queueCustomerRepo = myDataSource.manager.getRepository(
    dependencies.db.models.queueCustomer,
  );

  const cache = dependencies.db.cache;
  await queueCustomerRepo.update(
    { id: Number(queueCustomerId) },
    { notifyUsingSms },
  );
  // const cacheKey = `getCurrentQueueCustomerOfQueue:${queueCustomerId}`;
  // await cache.del(cacheKey);
}

export async function createQueueCustomer(
  cacheManager: Cache,

  queueCustomer: Partial<IQueueCustomer> & { number: number },
  transactionParam: EntityManager = null,
  dependencies: Dependencies = null,
  customer: ICustomer,
) /* : Promise<IQueueCustomer> */ {
  dependencies = injectDependencies(dependencies, ['db']);
  const queueRepo = transactionParam.getRepository(
    dependencies.db.models.queue,
  );
  const queueCustomerRepo = transactionParam.getRepository(
    dependencies.db.models.queueCustomer,
  );
  // const queueAreaRepo = transactionParam.getRepository(
  //   dependencies.db.models.queueArea,
  // );
  // const CustomerRepo = transactionParam.getRepository(
  //   dependencies.db.models.customer,
  // );
  const queue = await queueRepo.findOne({
    where: { id: queueCustomer.queueId },
  });
  // const queueAreas = await queueAreaRepo.find({
  //   where: {
  //     id: In(queueCustomer.areas.map((item) => item.queueAreaId)),
  //   },
  // });
  // console.log(queueAreas, 'aresa');
  return ensureTransaction(
    transactionParam,
    async (transaction) => {
      const newAreas = queueCustomer.areas
        ? queueCustomer.areas.map((area) => {
            const queueCustomerQueueArea = new QueueCustomerQueueArea();
            queueCustomerQueueArea.queueAreaId = area.queueAreaId;
            // queueCustomerQueueArea.queueCustomer = data;
            return queueCustomerQueueArea;
          })
        : [];
      const { areas: incomingAres, ...withoutAreas } = queueCustomer;
      const data = await queueCustomerRepo.create({
        queue,
        customer,
        joinTime: new Date(),
        areas: newAreas,
        ...withoutAreas,
      });
      queueCustomerRepo.save(data);
      if (queueCustomer.areas) {
        console.log(data, 'customer data');
      }
      if (queueCustomer.traits) {
        const traits = queueCustomer.traits.map((item) => ({
          ...item,
          queueCustomerId: data.id,
        }));
        await transactionParam
          .getRepository(dependencies.db.models.queueCustomerTrait)
          .createQueryBuilder()
          .insert()
          .into('queueCustomerTrait')
          .values(traits)
          .execute();
      }

      // const cache = dependencies.db.cache;
      // const cacheKey = `getCurrentQueueCustomerOfQueue:${queueCustomer.queueId}`;
      // await cache.del(cacheKey);
      console.log(data.areas, 'what was returned');
      return data;
    },
    dependencies,
  );
}

export async function getLastQueueCustomerOfCustomerInQueue(
  cacheManager: Cache,

  queueId: string,
  customerId: string,
  dependencies: Dependencies = null,
) {
  dependencies = injectDependencies(dependencies, ['db']);
  const cache = dependencies.db.cache;
  const queueCustomerRepo = myDataSource.getRepository(
    dependencies.db.models.queueCustomer,
  );

  // const cacheKey = `getLastQueueCustomerOfCustomerInQueue:${queueId}:${customerId}`;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return queueCustomerRepo.findOne({
    where: {
      queue: {
        id: Number(queueId),
      },
      customer: { id: customerId },
    },
    order: {
      joinTime: 'DESC',
    },
    relations: ['customer'],
  }) as unknown as IQueueCustomer;
  // await cache.set(cacheKey, data);
}
export async function totallyDeleteCustomer(
  cacheManager: Cache,

  queueCustomerId: number,
  dependencies: Dependencies = null,
  transaction: EntityManager = null,
): Promise<void> {
  //delete all keys
  dependencies = injectDependencies(dependencies, ['db']);
  const queueCustomerRepo = transaction.getRepository(
    dependencies.db.models.queueCustomer,
  );

  await queueCustomerRepo.delete({
    id: queueCustomerId,
  });
}
export async function removeQueueCustomerFromQueue(
  cacheManager: Cache,

  queueCustomerId: string,
  leaveReason: (typeof QueueCustomerLeaveReasons)[number],
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  const queueCustomerRepo = transaction.getRepository(
    dependencies.db.models.queueCustomer,
  );

  await queueCustomerRepo.update(
    {
      id: Number(queueCustomerId),
    },
    {
      leaveTime: new Date(),
      leaveReason,
    },
  );
}

export async function removeWaitingQueueCustomerFromQueue(
  cacheManager: Cache,

  queueId: string,
  queueCustomerId: string,
  leaveReason: (typeof QueueCustomerLeaveReasons)[number],
  dependencies: Dependencies = null,
): Promise<boolean> {
  dependencies = injectDependencies(dependencies, ['db']);
  const queueCustomerRepo = myDataSource.manager.getRepository(
    dependencies.db.models.queueCustomer,
  );

  const { affected } = await queueCustomerRepo.update(
    {
      id: Number(queueCustomerId),
      queue: {
        id: Number(queueId),
      },
      leaveTime: null,
      leaveReason: null,
    },
    {
      leaveTime: new Date(),
      leaveReason,
    },
  );
  return affected > 0;
}

export async function removeWaitingQueueCustomersFromQueue(
  cacheManager: Cache,

  queueId: string,
  leaveReason: (typeof QueueCustomerLeaveReasons)[number],
  dependencies: Dependencies = null,
): Promise<boolean> {
  dependencies = injectDependencies(dependencies, ['db']);
  const queueCustomerRepo = myDataSource.manager.getRepository(
    dependencies.db.models.queueCustomer,
  );
  const rows = await queueCustomerRepo.find({
    where: {
      queue: {
        id: Number(queueId),
      },
      leaveTime: IsNull(),
      leaveReason: IsNull(),
    },
    relations: ['queue'],
  });

  const { affected } = await queueCustomerRepo.update(
    {
      queue: {
        id: Number(queueId),
      },
      leaveTime: IsNull(),
      leaveReason: IsNull(),
    },
    {
      leaveTime: new Date(),
      leaveReason,
    },
  );
  return affected > 0;
}

export async function returnQueueCustomerToQueue(
  cacheManager: Cache,

  customerId: string,
  queueCustomerId: string,
  queueCustomerTTL: number,
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
): Promise<boolean> {
  dependencies = injectDependencies(dependencies, ['db']);
  const queueCustomerRepo = myDataSource.manager.getRepository(
    dependencies.db.models.queueCustomer,
  );

  // const whereConditions = { id: Number(queueCustomerId) };
  // if (customerId !== null) {
  //   whereConditions['customerId'] = customerId;
  // }
  // if (queueCustomerTTL !== null) {
  //   whereConditions['joinTime'] = {
  //     $gte: subMilliseconds(new Date(), queueCustomerTTL),
  //   };
  // }
  const { affected } = await queueCustomerRepo.update(
    {
      id: Number(queueCustomerId),
      // customerId,
      joinTime: MoreThanOrEqual(subMilliseconds(new Date(), queueCustomerTTL)),
    },
    {
      leaveTime: null,
      leaveReason: null,
      callTime: null,
      confirmed: false,
    },
  );
  return affected > 0;
}

export async function callQueueCustomer(
  cacheManager: Cache,

  queueCustomerId: string,
  queueId: string,
  transaction: EntityManager,
  dependencies: Dependencies = null,
): Promise<boolean> {
  dependencies = injectDependencies(dependencies, ['db']);
  const queueCustomerRepo = transaction.getRepository(
    dependencies.db.models.queueCustomer,
  );

  const { affected } = await queueCustomerRepo.update(
    {
      id: Number(queueCustomerId),
      queueId,
      leaveTime: IsNull(),
      leaveReason: IsNull(),
    },
    { callTime: new Date() },
  );
  return affected > 0;
}

export async function callQueueCustomerThatWasServed(
  cacheManager: Cache,

  queueCustomerId: string,
  queueId: string,
  dependencies: Dependencies = null,
): Promise<boolean> {
  dependencies = injectDependencies(dependencies, ['db']);
  const queueCustomerRepo = myDataSource.manager.getRepository(
    dependencies.db.models.queueCustomer,
  );

  const { affected } = await queueCustomerRepo.update(
    {
      id: Number(queueCustomerId),
      queue: { id: Number(queueId) },
      leaveTime: Not(IsNull()),
      leaveReason: 'served',
    },
    { callTime: new Date() },
  );
  return affected > 0;
}

export function getQueueCustomerOfQueue(
  cacheManager: Cache,

  queueCustomerId: string,
  queueId: string,
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
) {
  dependencies = injectDependencies(dependencies, ['db']);
  const queueCustomerRepo = myDataSource.manager.getRepository(
    dependencies.db.models.queueCustomer,
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return queueCustomerRepo.findOne({
    where: {
      id: Number(queueCustomerId),
      queue: {
        id: Number(queueId),
      },
    },
    relations: ['customer'],
  }) as unknown as IQueueCustomer;
}

export function getWaitingQueueCustomerWithCustomerQueueAndQueueGroup(
  cacheManager: Cache,

  queueCustomerId: string,
  dependencies: Dependencies = null,
) {
  dependencies = injectDependencies(dependencies, ['db']);
  const queueCustomerRepo = myDataSource.manager.getRepository(
    dependencies.db.models.queueCustomer,
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return queueCustomerRepo.findOne({
    where: {
      id: Number(queueCustomerId),
      leaveReason: null,
      leaveTime: null,
    },
    relations: ['customer', 'queue.queueGroup'],
  }) as unknown as IQueueCustomer;
}

export async function getQueueCustomerOfQueueGroup(
  cacheManager: Cache,

  queueCustomerId: number,
  customerId: string,
  queueId: number,
  queueGroupId: string,
  dependencies: Dependencies = null,
) /* : Promise<IQueueCustomer & { queue: IQueue & { queueGroup: IQueueGroup } }> */ {
  dependencies = injectDependencies(dependencies, ['db']);
  const queueCustomerRepo = myDataSource.manager.getRepository(
    dependencies.db.models.queueCustomer,
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const data = await queueCustomerRepo.findOne({
    where: {
      id: Number(queueCustomerId),
      queue: {
        id: Number(queueId),
        queueGroup: {
          id: Number(queueGroupId),
        },
      },
      customer: { id: customerId },
    },
    relations: ['queue'],
  });
  return data as unknown as IQueueCustomer & {
    queue: IQueue & { queueGroup: IQueueGroup };
  };
}

export function getNextQueueCustomerOfQueue(
  cacheManager: Cache,

  queueId: number,
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
) /* : Promise<IQueueCustomer> */ {
  dependencies = injectDependencies(dependencies, ['db']);
  const queueCustomerRepo = myDataSource.manager.getRepository(
    dependencies.db.models.queueCustomer,
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return queueCustomerRepo.findOne({
    where: {
      queue: {
        id: Number(queueId),
      },
      leaveTime: null,
    },

    relations: ['customer'],
    order: {
      joinTime: 'DESC',
    },
  }) as unknown as IQueueCustomer;
}

export async function updateQueueCustomer(
  cacheManager: Cache,

  queueCustomerId: number,
  updateObj: Partial<IQueueCustomer>,
  transactionParam: EntityManager = null,
  dependencies: Dependencies = null,
): Promise<boolean> {
  dependencies = injectDependencies(dependencies, ['db']);
  const queueAreaRepo = myDataSource.manager.getRepository(
    dependencies.db.models.queueCustomerQueueArea,
  );
  // let withoutAreas: Omit<IQueueCustomer, 'areas'> = updateObj
  const { id, traits, areas } = updateObj;
  const queueCustomerRepo = myDataSource.manager.getRepository(
    dependencies.db.models.queueCustomer,
  );
  const where = { id: queueCustomerId };
  return ensureTransaction(
    transactionParam,
    async (transaction) => {
      // const newAreas = updateObj.areas
      // First, fetch the entity from the database

      const queueCustomer = await queueCustomerRepo.findOne({
        where,
        relations: ['areas'],
      });
      console.log(queueCustomer, 'customer to be updated');
      // Then, map the objects in the array to instances of the QueueCustomerQueueArea entity
      const newAreas = areas.map((area) => {
        const queueCustomerQueueArea = new QueueCustomerQueueArea();
        queueCustomerQueueArea.queueAreaId = area.queueAreaId;
        queueCustomerQueueArea.queueCustomerId = queueCustomer.id;
        return queueCustomerQueueArea.queueArea;
      });

      // Check if the areas field has been updated
      const oldLength = queueCustomer.areas.length;
      const queueAreas = await queueAreaRepo.find({
        where: {
          id: In(areas.map((item) => item.queueAreaId)),
        },
      });
      console.log(queueAreas, 'from updating areas');
      queueCustomer.areas = queueAreas;
      const newLength = queueCustomer.areas.length;
      console.log(queueCustomer, 'after assigned');

      if (oldLength !== newLength) {
        // The areas field has been updated
        await queueCustomerRepo.save(queueCustomer);
      }
      // Merge the updateObj with the updated queueCustomer entity

      const { areas: oldAreas, traits, ...updateWithoutAreas } = updateObj;

      const { affected } = await queueCustomerRepo.update(where, {
        // areas: queueCustomer.areas,
        ...updateWithoutAreas,
      });

      // Delete any existing QueueCustomerTrait records
      await transactionParam
        .getRepository(dependencies.db.models.queueCustomerTrait)
        .delete({
          queueCustomer: { id: queueCustomerId },
        });

      // Create new QueueCustomerTrait records if necessary
      if (traits) {
        const newTraits = traits.map((item) => ({ ...item, queueCustomerId }));
        await transactionParam
          .getRepository(dependencies.db.models.queueCustomerTrait)
          .insert(newTraits);
      }

      // Delete any existing QueueCustomerQueueArea records
      await transactionParam
        .getRepository(dependencies.db.models.queueCustomerQueueArea)
        .delete({
          queueCustomer: { id: queueCustomerId },
        });

      // Create new QueueCustomerQueueArea records if necessary
      if (areas) {
        const newAreas = areas.map((item) => ({ ...item, queueCustomerId }));
        await transactionParam
          .getRepository(dependencies.db.models.queueCustomerQueueArea)
          .insert(newAreas);
      }

      return true;
    },
    dependencies,
  );
}

export async function updateQueueCustomerOfCustomerAndQueueGroup(
  cacheManager: Cache,

  queueCustomerId: number,
  customerId: string,
  queueId: number,
  updateObj: Partial<IQueueCustomer>,
  dependencies: Dependencies = null,
): Promise<boolean> {
  const queueCustomerRepo = myDataSource.manager.getRepository(
    dependencies.db.models.queueCustomer,
  );

  const { affected } = await queueCustomerRepo.update(
    {
      id: queueCustomerId,
      customer: {
        id: customerId,
      },
      queue: {
        id: queueId,
      },
    },
    { ...updateObj },
  );
  return affected > 0;
}

export function getQueueCustomerByIdAndCustomer(
  cacheManager: Cache,

  id: number,
  customerId: string,
  dependencies: Dependencies = null,
) /* : Promise<IQueueCustomer> */ {
  dependencies = injectDependencies(dependencies, ['db']);
  const queueCustomerRepo = myDataSource.manager.getRepository(
    dependencies.db.models.queueCustomer,
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return queueCustomerRepo.findOne({
    where: {
      id,
      customer: { id: customerId },
    },
    relations: ['customer'],
  });
}
export async function getCartitems(
  queueCustomerId: string,
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
) {
  const cartitemsRepo = transaction.getRepository(dependencies.db.models.cart);
  return cartitemsRepo.find({
    where: {
      queueCustomerId: Number(queueCustomerId),
    },
    relations: ['advertisement'],
  });
}
export async function updateCartitems(
  completed: boolean,
  cartId: string,
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
) {
  const cartitemsRepo = transaction.getRepository(dependencies.db.models.cart);
  return cartitemsRepo.update({ id: Number(cartId) }, { completed });
}
export async function deleteCartitems(
  cartId: number,
  caritemId: number,
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
) {
  const cartRepo = transaction.getRepository(dependencies.db.models.cart);
  const cartitemsRepo = transaction.getRepository(
    dependencies.db.models.cartitem,
  );

  const cart = await cartRepo.findOne({ where: { id: cartId } });
  if (!cart.cartItems.length) {
    await cartRepo.delete({ id: cart.id });
  }
  if (!cart) {
    throw new Error('Cart not found');
  }

  // Delete the associated cartItem entities
  await cartitemsRepo.delete({ id: caritemId });

  // Delete the cart entity
}

interface iAd extends IAdvertisement {
  customerQty?: number;
}
export async function addToCart(
  product: iAd[],
  totalPrice: number,
  orderPlaced: boolean,
  queueCustomerId: string,
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
) {
  if (product.length === 0) {
    // Handle the case where the product array is empty
    return;
  }

  const cartRepository = transaction.getRepository(dependencies.db.models.cart);
  const advertisementRepo = transaction.getRepository(
    dependencies.db.models.advertisement,
  );
  const customerRepo = transaction.getRepository(
    dependencies.db.models.queueCustomer,
  );

  const productIds = product.map((item) => Number(item.id));
  const quantities = product.map((item) => item.customerQty);

  const customer = await customerRepo.findOne({
    where: { id: Number(queueCustomerId) },
  });

  if (!customer) {
    // Handle the case where the customer is not found
    return;
  }

  console.log(product, totalPrice, orderPlaced);
  const advertisements = await advertisementRepo.findBy({ id: In(productIds) });

  // findByIds(productIds);

  const cartItems = [];

  for (let i = 0; i < advertisements.length; i++) {
    const advertisement = advertisements[i];
    const quantity = quantities[i];

    const cartItem = new CartItem();
    cartItem.advertisement = advertisement;
    cartItem.quantity = quantity;

    cartItems.push(cartItem);
  }

  const cart = new Cart();
  cart.cartItems = [];
  cart.queueCustomer = customer;
  cart.orderPlaced = orderPlaced;
  cart.totalPrice = totalPrice;
  cart.cartItems.push(...cartItems);

  await cartRepository.save(cart);
}

export default {
  getQueueArrayCustomersEnqueuedAfter,
  getWaitingQueueCustomer,
  getWaitingQueueCustomers,
  getWaitingQueueCustomerByPhone,
  getQueueCustomersLeftAfterQueueReset,
  getPreviousQueueCustomerOfQueue,
  getCurrentQueueCustomerOfQueue,
  setQueueCustomerNotifyUsingSms,
  createQueueCustomer,
  getLastQueueCustomerOfCustomerInQueue,
  removeQueueCustomerFromQueue,
  removeWaitingQueueCustomerFromQueue,
  removeWaitingQueueCustomersFromQueue,
  returnQueueCustomerToQueue,
  callQueueCustomer,
  getQueueCustomerOfQueue,
  getWaitingQueueCustomerWithCustomerQueueAndQueueGroup,
  getQueueCustomerOfQueueGroup,
  getNextQueueCustomerOfQueue,
  totallyDeleteCustomer,
  updateQueueCustomer,
  updateQueueCustomerOfCustomerAndQueueGroup,
  getQueueCustomerByIdAndCustomer,
  addToCart,
  getCartitems,
  updateCartitems,
  deleteCartitems,
  callQueueCustomerThatWasServed,
};
