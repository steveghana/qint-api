import {
  Dependencies,
  injectDependencies,
} from '../../../../../../apps/util/dependencyInjector';
import {
  getRandomAdvertisement,
  getAdvertisementByIdAndQueueGroup,
  getAdvertisementsOfQueueGroup,
  createAdvertisement,
  updateAdvertisementOfQueueGroup,
  destroyAdvertisementOfQueueGroup,
} from '../DBGateway/advertisement';
import { IAdvertisement } from '../../../../../types/advertisement';
import { EntityManager } from 'typeorm';
type AdvertWithBase64 = IAdvertisement &
  Partial<{
    base64Img: Buffer;
    price: string;
    currency: string;
  }>;
class Advertisement {
  private data: AdvertWithBase64 = null;

  constructor(data: AdvertWithBase64) {
    this.data = data;
  }

  static async getRandom(
    transaction: EntityManager,
    queueGroupId: string,
    dependencies: Dependencies = null,
  ): Promise<Advertisement> {
    dependencies = injectDependencies(dependencies, ['db']);
    const data = await getRandomAdvertisement(
      transaction,
      queueGroupId,
      dependencies,
    );
    if (!data) {
      return null;
    }
    return new Advertisement(data);
  }

  static async getByIdAndQueueGroup(
    transaction: EntityManager,
    advertisementId: string,
    queueGroupId: string,
    dependencies: Dependencies = null,
  ): Promise<Advertisement> {
    dependencies = injectDependencies(dependencies, ['db']);
    const data = await getAdvertisementByIdAndQueueGroup(
      transaction,
      advertisementId,
      queueGroupId,
      dependencies,
    );
    if (!data) {
      return null;
    }
    return new Advertisement(data);
  }

  static async ofQueueGroup(
    transaction: EntityManager,
    queueGroupId: string,
    dependencies: Dependencies = null,
  ): Promise<Advertisement[]> {
    dependencies = injectDependencies(dependencies, ['db']);
    const datas = await getAdvertisementsOfQueueGroup(
      transaction,
      queueGroupId,
      dependencies,
    );
    return datas.map((data) => new Advertisement(data));
  }

  static async create(
    transaction: EntityManager,
    data: IAdvertisement,
    base64: string,
    price: string,
    currency: string,
    dependencies: Dependencies = null,
  ): Promise<void> {
    dependencies = injectDependencies(dependencies, ['db']);
    await createAdvertisement(
      transaction,
      data,
      base64,
      price,
      currency,
      dependencies,
    );
  }

  static async updateOfQueueGroup(
    transaction: EntityManager,
    advertisementId: string,
    queueGroupId: string,
    data: Partial<IAdvertisement>,
    dependencies: Dependencies = null,
  ): Promise<[number]> {
    dependencies = injectDependencies(dependencies, ['db']);
    const [updatedRows] = await updateAdvertisementOfQueueGroup(
      transaction,
      advertisementId,
      queueGroupId,
      data,
      dependencies,
    );
    return [updatedRows];
  }

  static async destroyOfQueueGroup(
    transaction: EntityManager,
    advertisementId: string,
    queueGroupId: string,
    dependencies: Dependencies = null,
  ): Promise<boolean> {
    dependencies = injectDependencies(dependencies, ['db']);
    const deletedRows = await destroyAdvertisementOfQueueGroup(
      transaction,
      advertisementId,
      queueGroupId,
      dependencies,
    );
    return deletedRows !== 0;
  }

  get id(): string {
    return this.data && this.data.id;
  }

  get text(): string {
    return this.data && this.data.text;
  }
  get description(): string {
    return this.data && this.data.description;
  }

  get imageUrl(): string {
    return this.data && this.data.imageUrl;
  }
  get base64imageUrl(): string {
    return this.data && this.data.base64Img.toString('base64');
  }
  get price(): string {
    return this.data && this.data.price;
  }
  get currency(): string {
    return this.data && this.data.currency;
  }
  get addType(): string {
    return this.data && this.data.addType;
  }

  get queueGroupId(): string {
    return this.data && this.data.queueGroupId;
  }
}

export default Advertisement;
