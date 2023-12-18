// import { ResultBoundary } from '..';
import {
  Dependencies,
  injectDependencies,
} from '../../../../../util/dependencyInjector';
import { IQueueGroup } from '../../../../../types/queueGroup';
import { useTransaction } from '../../../../../Config/transaction';
import QueueGroupUserPermission from '../../Permissions/Entity/queueGroupUserPermission';
import {
  BadRequestException,
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Next,
} from '@nestjs/common';
import { RedisCacheService } from '../../../../../redis/redis.service';
import { Cache } from 'cache-manager';
import { IAdvertisement } from '../../../../../../apps/types/advertisement';
import Advertisement from '../Entity/advertisement';
type GetQueueGroupByEmailFailureReason = "doesn't exist";

@Injectable()
export class AdvertisementService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  async getRandom(queueGroupId: string, dependencies: Dependencies = null) {
    return useTransaction(async (transaction) => {
      dependencies = injectDependencies(dependencies, ['db']);

      const ad = await Advertisement.getRandom(
        transaction,
        queueGroupId,
        dependencies,
      );
      if (!ad) {
        return new HttpException("doesn't exist", HttpStatus.BAD_REQUEST);
      }
      return {
        id: ad.id,
        text: ad.text,
        imageUrl: ad.imageUrl,
        queueGroupId: ad.queueGroupId,
      };
    }, dependencies);
  }

  async get(
    queueGroupId: string,
    advertisementId: string,
    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db']);
    return useTransaction(async (transaction) => {
      const ad = await Advertisement.getByIdAndQueueGroup(
        transaction,
        advertisementId,
        queueGroupId,
        dependencies,
      );
      if (!ad) {
        throw new HttpException("doesn't exist", HttpStatus.BAD_REQUEST);
      }
      return {
        id: ad.id,
        text: ad.text,
        imageUrl: ad.imageUrl,
        addType: ad.addType,
        price: ad.price,
        currency: ad.currency,
        description: ad.description,
        queueGroupId: ad.queueGroupId,
      };
    }, dependencies);
  }

  async getAll(queueGroupId: string, dependencies: Dependencies = null) {
    dependencies = injectDependencies(dependencies, ['db']);
    return useTransaction(async (transaction) => {
      const ads = await Advertisement.ofQueueGroup(
        transaction,
        queueGroupId,
        dependencies,
      );

      return ads.map((ad) => ({
        id: ad.id,
        text: ad.text,
        imageUrl: ad.imageUrl,
        price: ad.price,
        addType: ad.addType,
        currency: ad.currency,
        description: ad.description,
        base64img: ad.base64imageUrl,
        queueGroupId: ad.queueGroupId,
      }));
    }, dependencies);
  }

  async create(
    requestingUserEmail: string,
    queueGroupId: string,
    advertisement: IAdvertisement,
    base64?: string,
    price?: string,
    currency?: string,
    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db']);
    return useTransaction(async (transaction) => {
      const permission = await QueueGroupUserPermission.ofUserInQueueGroup(
        this.cacheManager,
        queueGroupId,
        requestingUserEmail,
        dependencies,
      );
      if (!permission || !permission.isOwner) {
        throw new HttpException('not owner', HttpStatus.FORBIDDEN);
      }

      await Advertisement.create(
        transaction,
        {
          text: advertisement.text,
          imageUrl: advertisement.imageUrl,
          addType: advertisement.addType,
          queueGroupId: queueGroupId,
          description: advertisement.description,
        },
        base64,
        price,
        currency,
        dependencies,
      );
    }, dependencies);
  }

  async edit(
    requestingUserEmail: string,
    queueGroupId: string,
    advertisementId: string,
    advertisement: Partial<IAdvertisement>,

    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db']);
    return useTransaction(async (transaction) => {
      const permission = await QueueGroupUserPermission.ofUserInQueueGroup(
        this.cacheManager,
        queueGroupId,
        requestingUserEmail,
        dependencies,
      );
      if (!permission || !permission.isOwner) {
        throw new HttpException('not owner', HttpStatus.FORBIDDEN);
      }
      const updateObj: Partial<IAdvertisement> = {};
      const addIfExists = (key: keyof IAdvertisement) => {
        if (advertisement[key] !== null && advertisement[key] !== undefined) {
          updateObj[key] = advertisement[key];
        }
      };
      (
        [
          'text',
          'imageUrl',
          'currency',
          'addType',
          'base64',
          'price',
          'description',
        ] as Array<keyof IAdvertisement>
      ).forEach((key) => addIfExists(key));

      const [updatedRows] = await Advertisement.updateOfQueueGroup(
        transaction,
        advertisementId,
        queueGroupId,
        updateObj,
        dependencies,
      );
      if (updatedRows === 0) {
        throw new HttpException('not found', HttpStatus.NOT_FOUND);
      }
    }, dependencies);
  }

  async destroy(
    requestingUserEmail: string,
    queueGroupId: string,
    advertisementId: string,
    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db']);
    return useTransaction(async (transaction) => {
      const permission = await QueueGroupUserPermission.ofUserInQueueGroup(
        this.cacheManager,
        queueGroupId,
        requestingUserEmail,
        dependencies,
      );
      if (!permission || !permission.isOwner) {
        throw new HttpException('not found', HttpStatus.FORBIDDEN);
      }

      const deleted = await Advertisement.destroyOfQueueGroup(
        transaction,
        advertisementId,
        queueGroupId,
        dependencies,
      );
      if (!deleted) {
        throw new HttpException('not found', HttpStatus.NOT_FOUND);
      }
    }, dependencies);
  }
}
