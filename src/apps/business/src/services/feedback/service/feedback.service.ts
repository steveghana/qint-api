// import { ResultBoundary } from '..';
import {
  Dependencies,
  injectDependencies,
} from '../../../../../util/dependencyInjector';
import { useTransaction } from '../../../../../Config/transaction';
import QueueGroup from '../../Root/Entity/queueGroup';
import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Next,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { IFeedback } from '../../../../../types/feedback';
import Feedback from '../Entity/feedback';
type GetQueueGroupByEmailFailureReason = "doesn't exist";
@Injectable()
export class FeedbackService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  async create(feedback: IFeedback, dependencies: Dependencies = null) {
    dependencies = injectDependencies(dependencies, ['db']);
    await Feedback.create(feedback, dependencies);
  }
  async getAllFeedback(
    queueGroupId: string,
    dependencies: Dependencies = null,
  ): Promise<IFeedback[]> {
    dependencies = injectDependencies(dependencies, ['db']);
    const feedback = await Feedback.get(dependencies, queueGroupId);
    return feedback;
  }

  async getQueueGroupByEmail(
    email: string,
    dependencies: Dependencies = null,
  ) /* Promise<GetQueueGroupByEmailSuccess | GetQueueGroupByEmailFailure> */ {
    dependencies = injectDependencies(dependencies, ['db']);
    return useTransaction(async (transaction) => {
      console.log(email, 'from service business');
      const queueGroup = await QueueGroup.getByEmail(
        email,
        this.cacheManager,
        dependencies,
      );
      // this.cacheManager
      if (!queueGroup) {
        new HttpException("doesn't exist", HttpStatus.BAD_REQUEST);
        return;
      }
      return {
        id: queueGroup.id,
        name: queueGroup.name,
        countryCode: queueGroup.countryCode,
        logoUrl: queueGroup.logoUrl,
        phone: queueGroup.phone,
        address: queueGroup.address,
        centerLat: queueGroup.centerLat,
        centerLong: queueGroup.centerLong,
        geometryLat: queueGroup.geometryLat,
        geometryLong: queueGroup.geometryLong,
        type: queueGroup.type,
        queues: queueGroup.queues,
        permissions: queueGroup.permissions,
      };
    }, dependencies);
  }
}
