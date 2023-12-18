import { Dependencies, injectDependencies } from '../../../../../util/dependencyInjector';
import { createFeedback, getFeedback } from '../DBGateway/feedback';
import { IFeedback } from '../../../../../types/feedback';
import { useTransaction } from '../../../../../Config/transaction';

class Feedback {
    static async create(data: IFeedback, dependencies: Dependencies = null): Promise<void> {
        dependencies = injectDependencies(dependencies, ['db']);
        return useTransaction(async (transaction) => {
            await createFeedback(transaction, data, dependencies);
        }, dependencies);

    }
    static async get(dependencies: Dependencies = null, queueGroupId: string): Promise<IFeedback[]> {
        dependencies = injectDependencies(dependencies, ['db']);
        return useTransaction(async (transaction) => {
            return await getFeedback(transaction, dependencies, queueGroupId);
        }, dependencies);

    }
}

export default Feedback;