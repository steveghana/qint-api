// import { EntityManager } from 'sequelize';
import { addDays } from 'date-fns';
import {
  Dependencies,
  injectDependencies,
} from '../../../../util/dependencyInjector';
import { getCustomersCountBeforeMe } from '../../../../util/queue';
import { getQueueWithQueueGroup } from '../../../../queue/src/services/DBGateway/queue';
import {
  getCurrentQueueCustomerOfQueue,
  getWaitingQueueCustomers,
} from '../../../../customer/src/services/QueueCustomer/DBGateway/queueGroupEntityGateway';
import notifier from '../../../../util/notification';
import ShortUrl from '../Entity/shortUrl';
import { EntityManager } from 'typeorm';
import config from '../../../../Config/config';
import { I18nContext, I18nService } from 'nestjs-i18n';

async function createQueueCustomerLink(
  queueGroupId: string,
  queueId: string,
  QRId: string,
  customerId: string,
  queueCustomerId: string,
  dependencies: Dependencies = null,
): Promise<string> {
  dependencies = injectDependencies(dependencies, []);
  const prefix =
    process.env.NODE_ENV === 'production'
      ? `${config.customerURL}/#/s/`
      : 'http://localhost:8080/#/s/';
  const longUrlComponent = `/c/${encodeURIComponent(
    queueGroupId,
  )}/${encodeURIComponent(queueId)}/${encodeURIComponent(
    QRId,
  )}/?cid=${encodeURIComponent(customerId)}&qcid=${encodeURIComponent(
    queueCustomerId,
  )}`;
  const shortUrlComponent = await ShortUrl.create(
    null,
    longUrlComponent,
    addDays(Date.now(), 1),
    dependencies,
  );
  console.log(prefix + encodeURIComponent(shortUrlComponent));
  return prefix + encodeURIComponent(shortUrlComponent);
}

export async function sendNotifications(
  queueId: string,
  notifyLaterCustomers: boolean,
  transaction: EntityManager,
  i18n?: I18nContext<Record<string, unknown>>,

  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db', 'sms', 'push']);
  const queuePromise = getQueueWithQueueGroup(
    null,
    queueId,
    transaction,
    dependencies,
  );
  await Promise.all([
    (async () => {
      const [currentCustomer, queue] = await Promise.all([
        getCurrentQueueCustomerOfQueue(
          null,
          queueId,
          transaction,
          dependencies,
        ),
        queuePromise,
      ]);

      if (currentCustomer && currentCustomer.customer) {
        const url = await createQueueCustomerLink(
          String(queue.queueGroupId),

          queueId,
          queue.QRId,
          currentCustomer.customerId,
          String(currentCustomer.id),
          dependencies,
        );

        await notifier.notify(
          null,
          currentCustomer.customer as any,
          currentCustomer.notifyUsingSms,
          'yourTurnArrived',
          queue.queueGroup.type,
          {
            queueName: queue.name,
            queueGroupName: queue.queueGroup.name,
            customerName: currentCustomer.customer.name,
            url,
          },
          { queueGroupId: queue.queueGroupId, queueId, QRId: queue.QRId },
          true,
          dependencies,
          i18n,
          currentCustomer.leaveReason,
        );
      }
    })(),
    (async () => {
      if (!notifyLaterCustomers) {
        return;
      }

      const [waitingCustomers, queue] = await Promise.all([
        getWaitingQueueCustomers(null, queueId, transaction, dependencies),
        queuePromise,
      ]);

      await Promise.all(
        waitingCustomers.map(async (queueCustomer) => {
          if (queueCustomer.customer) {
            const inQueueBeforeMe = getCustomersCountBeforeMe(
              waitingCustomers,
              String(queueCustomer.id),
            );
            if (inQueueBeforeMe === 3 || inQueueBeforeMe === 5) {
              await notifier.notify(
                null,
                queueCustomer.customer as any,
                queueCustomer.notifyUsingSms,
                'yourTurnIsNearing',
                queue.queueGroup.type,
                {
                  queueName: queue.name,
                  queueGroupName: queue.queueGroup.name,
                  customerName: queueCustomer.customer.name,
                  inQueueBeforeMe,
                },
                { queueGroupId: queue.queueGroupId, queueId },
                false,
                dependencies,
                i18n,
                queueCustomer.leaveReason,
              );
            }
          }
        }),
      );
    })(),
  ]);
}

export default {
  createQueueCustomerLink,
  sendNotifications,
};
