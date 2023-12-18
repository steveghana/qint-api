import { Dependencies, injectDependencies } from '../util/dependencyInjector';
import { QueueCustomerService } from '../customer/src/services/QueueCustomer/service/index.service';

// import queueCustomerInteractor from '../interactor/queueGroup/queue/customer';
import validationUtil from '../util/validation';

export function init(dependencies: Dependencies = null): void {
  console.log('sms initialised');
  dependencies = injectDependencies(dependencies, ['sms']);

  dependencies.sms.addReceiveMessageListener(
    async (body: string, from: string) => {
      if (!validationUtil.isId(body)) {
        return;
      }

      await QueueCustomerService.prototype.enqueue(
        null,
        body.trim(),
        {
          phone: from,
        },
        { id: null, notifyUsingSms: true },
        dependencies,
      );
    },
  );
}

export default {
  init,
};
