import {
  Dependencies,
  injectDependencies,
} from '../../../../../util/dependencyInjector';
import { IAdvertisement } from '../../../../../types/advertisement';
import { EntityManager } from 'typeorm';

export function getRandomAdvertisement(
  transaction: EntityManager,
  queueGroupId: string,
  dependencies: Dependencies = null,
) {
  dependencies = injectDependencies(dependencies, ['db']);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const advertisementRepo = transaction.getRepository(
    dependencies.db.models.advertisement,
  );
  return advertisementRepo.findOne({
    // order: dependencies.db.sequelize.random(),
    where: {
      queueGroup: { id: Number(queueGroupId) },
    },
  }) as unknown as IAdvertisement;
}

export function getAdvertisementByIdAndQueueGroup(
  transaction: EntityManager,

  advertisementId: string,
  queueGroupId: string,
  dependencies: Dependencies = null,
) {
  dependencies = injectDependencies(dependencies, ['db']);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const advertisementRepo = transaction.getRepository(
    dependencies.db.models.advertisement,
  );
  return advertisementRepo.findOne({
    where: {
      id: Number(advertisementId),
      queueGroup: { id: Number(queueGroupId) },
    },
  }) as unknown as IAdvertisement;
}

export function getAdvertisementsOfQueueGroup(
  transaction: EntityManager,

  queueGroupId: string,
  dependencies: Dependencies = null,
) {
  dependencies = injectDependencies(dependencies, ['db']);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const advertisementRepo = transaction.getRepository(
    dependencies.db.models.advertisement,
  );
  return advertisementRepo.find({
    where: {
      queueGroup: { id: Number(queueGroupId) },
    },
  }) as unknown as IAdvertisement[];
}

export async function createAdvertisement(
  transaction: EntityManager,

  advertisement: IAdvertisement,
  base64: string,
  price: string,
  currency: string,
  dependencies: Dependencies = null,
) {
  dependencies = injectDependencies(dependencies, ['db']);
  const advertisementRepo = transaction.getRepository(
    dependencies.db.models.advertisement,
  );
  let image = Buffer.from(base64 || '', 'base64');
  console.log(advertisement);
  let data = await advertisementRepo.create({
    text: advertisement.text,
    imageUrl: advertisement.imageUrl,
    base64Img: image,
    price,
    addType: advertisement.addType,
    currency,
    description: advertisement.description || '',
    queueGroup: { id: Number(advertisement.queueGroupId) },
    // queueGroup: {id: advertisement.queueGroupId},
  });
  console.log(data);
  await advertisementRepo.save(data);
}

export async function updateAdvertisementOfQueueGroup(
  transaction: EntityManager,

  advertisementId: string,
  queueGroupId: string,
  updateObj: Partial<IAdvertisement>,
  dependencies: Dependencies = null,
): Promise<[number]> {
  dependencies = injectDependencies(dependencies, ['db']);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const advertisementRepo = transaction.getRepository(
    dependencies.db.models.advertisement,
  );
  console.log(updateObj, queueGroupId);
  const { affected } = await advertisementRepo.update(
    {
      id: Number(advertisementId),
      queueGroup: { id: Number(queueGroupId) },
      // queueGroupId: queueGroupId,
    },
    {
      // queueGroupId: Number(queueGroupId),
      text: updateObj.text,
      addType: updateObj.addType,
      imageUrl: updateObj.imageUrl,
      description: updateObj.description || '',
      price: updateObj.price,
      currency: updateObj.currency,

      // id: Number(updateObj.id) as unknown as number,
    },
  );
  return [affected];
}

export async function destroyAdvertisementOfQueueGroup(
  transaction: EntityManager,

  advertisementId: string,
  queueGroupId: string,
  dependencies: Dependencies = null,
): Promise<number> {
  dependencies = injectDependencies(dependencies, ['db']);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const advertisementRepo = transaction.getRepository(
    dependencies.db.models.advertisement,
  );
  const { affected } = await advertisementRepo.delete({
    id: Number(advertisementId),
    queueGroup: { id: Number(queueGroupId) },
  });
  return affected;
}

export default {
  getRandomAdvertisement,
  getAdvertisementByIdAndQueueGroup,
  getAdvertisementsOfQueueGroup,
  createAdvertisement,
  updateAdvertisementOfQueueGroup,
  destroyAdvertisementOfQueueGroup,
};
