import {
  Dependencies,
  injectDependencies,
} from '../../../../util/dependencyInjector';
import { IQueue } from '../../../../types/queue';
import { IQueueGroup } from '../../../../types/queueGroup';
import { IQueueCustomer } from '../../../../types/queueCustomer';
import { DeepPartial, EntityManager } from 'typeorm';
import { Cache } from 'cache-manager';
import myDataSource from '../../../../../../db/data-source';
export async function getQueueIdsOfQueueGroup(
  cacheManager: Cache,
  queueGroupId: string,
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
) /* : Promise<string[]> */ {
  dependencies = injectDependencies(dependencies, ['db']);

  const queues = (await transaction
    .getRepository(dependencies.db.models.queue)
    .find({
      where: {
        queueGroup: { id: Number(queueGroupId) },
      } as unknown as IQueue,
    })) as unknown as IQueue[];
  // console.log(queues, 'from analytics');
  return queues.map((queue) => String(queue.id));
}
export async function getQueueForProcessing(
  cacheManager: Cache,
  queueId: string,
  transaction: EntityManager = null,

  dependencies: Dependencies = null,
) {
  dependencies = injectDependencies(dependencies, ['db']);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const data = await transaction
    .getRepository(dependencies.db.models.queue)
    .createQueryBuilder('queue')
    .leftJoinAndSelect(
      'queue.queueCustomers',
      'queueCustomers',
      'queueCustomers.leaveTime IS NULL',
    )
    .leftJoinAndSelect('queueCustomers.customer', 'customer')
    .leftJoinAndSelect('queueCustomers.traits', 'traits')
    .leftJoinAndSelect('queueCustomers.areas', 'areas')
    .leftJoinAndSelect('queueCustomers.cart', 'cart')
    .leftJoinAndSelect('cart.cartItems', 'cartItems')
    .leftJoinAndSelect('cartItems.advertisement', 'advertisement')
    .leftJoinAndSelect('areas.queueArea', 'queueArea')
    .leftJoinAndSelect('queue.queueGroup', 'queueGroup')
    .leftJoinAndSelect('queueGroup.tables', 'tables')
    .leftJoinAndSelect('queueGroup.areas', 'area')
    .leftJoinAndSelect(
      'queue.currentlyServedQueueCustomer',
      'currentlyServedQueueCustomer',
    )
    .leftJoinAndSelect(
      'currentlyServedQueueCustomer.customer',
      'currentlyServedCustomer',
    )
    .where('queue.id = :id', { id: Number(queueId) })
    .orderBy('queueCustomers.number', 'ASC')
    .addOrderBy('queueCustomers.id', 'ASC')
    .getOne();
  console.log(data, 'from processing');
  return data as unknown as IQueue & {
    queueCustomers: IQueueCustomer[];
    currentlyServedQueueCustomer?: IQueueCustomer;
    queueGroup: IQueueGroup;
  };
}
export async function incrementQueueNextEnqueueNumber(
  cacheManager: Cache,
  queueId: string,
  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  let queueRepo = myDataSource.manager.getRepository(
    dependencies.db.models.queue,
  );
  let queue = await queueRepo.findOne({ where: { id: Number(queueId) } });
  queue.nextEnqueueNumber++;
  await queueRepo.save(queue);
}
export async function getQueueWithGroupByWaitingCustomer(
  cacheManager: Cache,
  queueId: string,
  queueGroupId: string,
  customerId: string,
  dependencies: Dependencies = null,
): Promise<
  IQueue & {
    queueGroup: IQueueGroup;
    queueCustomers: IQueueCustomer[];
  }
> {
  dependencies = injectDependencies(dependencies, ['db']);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  let queueRepo = myDataSource.manager.getRepository(
    dependencies.db.models.queue,
  );
  console.log('queue entered');
  const data = await queueRepo.findOne({
    where: {
      id: Number(queueId),
      // queueGroupId, queueCustomers:true,
      queueGroupId: Number(queueGroupId),
    } as unknown as IQueue & {
      queueGroup: IQueueGroup;
      queueCustomers: IQueueCustomer[];
    },
    // relations: ['queueGroup'],
  });
  console.log(data, 'queue cmp');

  return data as unknown as IQueue & {
    queueGroup: IQueueGroup;
    queueCustomers: IQueueCustomer[];
  };
}

export async function getQueueOfQueueGroup(
  cacheManager: Cache,

  queueId: string,
  queueGroupId: string,

  dependencies: Dependencies = null,
) /* : Promise<IQueue> */ {
  dependencies = injectDependencies(dependencies, ['db']);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  console.log('getqueueofqueuegroup');
  let queueRepo = myDataSource.manager.getRepository(
    dependencies.db.models.queue,
  );
  const data = await queueRepo.findOne({
    where: {
      id: Number(queueId),
      queueGroup: { id: Number(queueGroupId) },
    } as unknown as IQueue,
    relations: ['queueGroup'],
  });
  return data as unknown as IQueue;
}
export async function updateQRId(
  cacheManager: Cache,

  queueId: string,
  QRId: string,
  dependencies: Dependencies = null,
): Promise<void> {
  // dependencies = injectDependencies(dependencies, ['db']);
  // await dependencies.db.models.queue.update(
  //     { QRId },
  //     {
  //         where: {
  //             id: queueId,
  //         },
  //         transaction,
  //     }
  // );
}

export function getQueueWithQueueGroup(
  cacheManager: Cache,

  queueId: string,
  transaction: EntityManager = null,

  dependencies: Dependencies = null,
) {
  dependencies = injectDependencies(dependencies, ['db']);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return transaction.getRepository(dependencies.db.models.queue).findOne({
    where: {
      id: Number(queueId),
    },
    relations: ['queueGroup'],
  }) as unknown as Promise<IQueue & { queueGroup?: IQueueGroup }>;
}

export async function setQueueCurrentlyServedCustomer(
  cacheManager: Cache,

  queueId: string,
  queueCustomerId: number,
  transaction: EntityManager = null,

  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  await transaction.getRepository(dependencies.db.models.queue).update(
    {
      id: Number(queueId),
    },
    {
      currentlyServedQueueCustomer: {
        id: queueCustomerId ?? null,
      },
      // currentlyServedQueueCustomerId: queueCustomerId ?? null,
    },
  );
}
export async function resetQueueCurrentlyServedCustomer(
  cacheManager: Cache,

  queueId: string,
  transaction: EntityManager = null,

  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  await myDataSource.manager.getRepository(dependencies.db.models.queue).update(
    {
      id: Number(queueId),
    },
    {
      currentlyServedQueueCustomer: null,
    },
  );
}

export async function createQueue(
  cacheManager: Cache,

  queue: Partial<IQueue> & { name: string },
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
) /* : Promise<IQueue>  */ {
  dependencies = injectDependencies(dependencies, ['db']);
  const queueRepo = transaction.getRepository(dependencies.db.models.queue);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  //@ts-ignore
  const businessRep = transaction.getRepository(
    dependencies.db.models.queueGroup,
  );
  const business = await businessRep.findOne({
    where: {
      id: Number(queue.queueGroupId),
    },
  });
  // let newQueue = new QueueEntity()
  let newqueue = await queueRepo.create({ ...queue, queueGroup: business });
  // newQueue.queueGroup = business
  return await queueRepo.save(newqueue);
}

export async function destroyQueue(
  cacheManager: Cache,
  queueId: string,
  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  let queueRepo = myDataSource.manager.getRepository(
    dependencies.db.models.queue,
  );
  await queueRepo.delete({
    id: Number(queueId),
  });
}

export async function resetQueueNextEnqueueNumber(
  cacheManager: Cache,

  queueId: string,
  transaction: EntityManager = null,
  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  await transaction.getRepository(dependencies.db.models.queue).update(
    {
      id: Number(queueId),
    },
    {
      nextEnqueueNumber: 1,
      resetNumberTime: new Date(),
    },
  );
}

export async function updateIsCustomDisplay(
  cacheManager: Cache,

  queueId: string,
  isCustomDisplay: boolean,
  transaction: EntityManager = null,

  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  await transaction.getRepository(dependencies.db.models.queue).update(
    {
      id: Number(queueId),
    },
    { isCustomDisplay },
  );
}

export default {
  getQueueIdsOfQueueGroup,
  getQueueForProcessing,
  resetQueueCurrentlyServedCustomer,
  incrementQueueNextEnqueueNumber,
  getQueueWithGroupByWaitingCustomer,
  getQueueOfQueueGroup,
  getQueueWithQueueGroup,
  setQueueCurrentlyServedCustomer,
  createQueue,
  updateQRId,
  destroyQueue,
  resetQueueNextEnqueueNumber,
};
