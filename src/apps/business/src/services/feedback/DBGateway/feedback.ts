import {
  Dependencies,
  injectDependencies,
} from '../../../../../util/dependencyInjector';
import { IFeedback } from '../../../../../types/feedback';
import { EntityManager } from 'typeorm';

export async function createFeedback(
  transaction: EntityManager,
  feedback: IFeedback,
  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  // feedbac
  const feedbackRepo = transaction.getRepository(
    dependencies.db.models.feedback,
  );
  let create = await feedbackRepo.create({ businessId: 1, ...feedback });
  await feedbackRepo.save(create);
}

export async function getFeedback(
  transaction: EntityManager,
  dependencies: Dependencies = null,
  queueGroupId: string,
): Promise<IFeedback[]> {
  dependencies = injectDependencies(dependencies, ['db']);

  let feedback = await transaction
    .getRepository(dependencies.db.models.feedback)
    ?.find({ where: { businessId: Number(queueGroupId) } });
  return feedback as unknown as IFeedback[];
}

export default {
  createFeedback,
};
