import {
  Dependencies,
  injectDependencies,
} from '../../../../../util/dependencyInjector';
import entityGatewayTransaction, {
  useTransaction,
} from '../../../../../util/transaction';
// import { ResultBoundary } from '../..';
import { ICustomer } from '../../../../../types/customer';
import { IQueueGroup } from '../../../../../types/queueGroup';
import queueUtil, { sendNotifications } from './util';
import queueEntityGateway, {
  getQueueForProcessing,
  getQueueWithGroupByWaitingCustomer,
  setQueueCurrentlyServedCustomer,
} from '../../../../../queue/src/services/DBGateway/queue';
import { I18nService } from 'nestjs-i18n';
import queueCustomerEntityGateway, {
  getNextQueueCustomerOfQueue,
  getQueueCustomerByIdAndCustomer,
  getQueueCustomerOfQueue,
  getQueueCustomerOfQueueGroup,
  getWaitingQueueCustomerByPhone,
  removeQueueCustomerFromQueue,
  setQueueCustomerNotifyUsingSms,
  updateQueueCustomer,
} from '../DBGateway/queueGroupEntityGateway';
import notifier, { vapidEncryptionKey } from '../../../../../util/notification';
import cryptoUtil from '../../../../../util/crypto';
import QueueGroupUserPermission from '../../../../../business/src/services/Permissions/Entity/queueGroupUserPermission';
import Customer from '../../customer/Entity/customer';
import { hoursToMilliseconds } from 'date-fns';
import languageUtil from '../../../../../util/language';
import deferredTask from '../../../../../util/deferredTask';
import hebrewSmsLocalization from '../../../../../util/locale/he.json';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  Inject,
  CACHE_MANAGER,
  Next,
} from '@nestjs/common';
import { IQueue } from '../../../../../types/queue';
import {
  IQueueCustomer,
  QueueCustomerLeaveReasons,
} from '../../../../../types/queueCustomer';
import { Cache } from 'cache-manager';
import { QueueCustomerEntity } from '../../../../../customer/src/models/QueueCustomer/queueCustomer.entity';
import { I18n, I18nContext } from 'nestjs-i18n';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { IAdvertisement } from '@/apps/types/advertisement';
type GetQueueGroupByEmailFailureReason = "doesn't exist";
type PushSubscriptions = {
  endpoint: string;
  p256dhKey: string;
  authKey: string;
} & Partial<PushSubscription>;

@Injectable()
export class QueueCustomerService {
  private logger = new Logger(QueueCustomerService.name);
  // @WebSocketServer()
  // server: AppGateway;
  constructor(
    // private readonly server: AppGateway,
    private readonly i18n: I18nService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async notifyInCaseOfArrival(
    i18n: I18nContext<Record<string, unknown>>,

    queueId: string,
    queueGroupId: string,
    queueCustomerId: string,
    queue: IQueue,
    queueCustomer: IQueueCustomer,
    dependencies: Dependencies = null,
  ): Promise<void> {
    this.logger.debug('start debugging');
    dependencies = injectDependencies(dependencies, ['db', 'ws', 'sms']);

    const isRestaurantOrBar =
      queue.queueGroup.type === 'Restaurant & Cafe' ||
      queue.queueGroup.type === 'Bar';
    if (isRestaurantOrBar) {
      const url = await queueUtil.createQueueCustomerLink(
        this.cacheManager,
        queueGroupId,
        queueId,
        queue.QRId,
        queueCustomer.customerId,
        queueCustomerId,
        dependencies,
      );
      console.log(url);
      await notifier.notify(
        this.cacheManager,
        queueCustomer.customer,
        queueCustomer.notifyUsingSms,
        'yourTurnArrived',
        queue.queueGroup.type,
        {
          queueName: queue.name,
          queueGroupName: queue.queueGroup.name,
          customerName: queueCustomer.customer.name,
          url,
        },
        {
          queueGroupId,
          queueId,
          QRId: queue.QRId,
          queueCustomerId,
          customerId: queueCustomer.customerId,
        },
        true,
        dependencies,
        i18n,
        queueCustomer.leaveReason,
      );
    }

    if (queueCustomer.callTime) {
      this.logger.log(
        `Broadcasted eventqueueGroup/${encodeURIComponent(
          queueGroupId,
        )}/queue/${encodeURIComponent(
          queueId,
        )}/callAgain/customer/${encodeURIComponent(queueCustomer.customer.id)}`,
      );
      // dependencies.ws.
      dependencies.ws.publish(
        `queueGroup/${encodeURIComponent(
          queueGroupId,
        )}/queue/${encodeURIComponent(
          queueId,
        )}/callAgain/customer/${encodeURIComponent(queueCustomer.customer.id)}`,
      );
    }
    this.logger.debug('Finished myMethod');
  }

  async enqueue(
    i18n: I18nContext<Record<string, unknown>>,
    queueId: string,
    customer: Partial<ICustomer>,
    queueCustomerData: Partial<IQueueCustomer>,
    dependencies: Dependencies = null,
  ) /* : Promise<EnqueueSuccess | EnqueueFailure> */ {
    dependencies = injectDependencies(dependencies, ['db', 'ws', 'sms']);
    this.logger.debug('start debugging');

    return entityGatewayTransaction.useTransaction(async (transaction) => {
      const queue = await queueEntityGateway.getQueueForProcessing(
        this.cacheManager,
        queueId,
        transaction,
      );
      if (!queue) {
        return new HttpException('not found', HttpStatus.BAD_REQUEST);
        // return new EnqueueFailure('not found');
      }

      const currentlyServedCustomer = queue.currentlyServedQueueCustomer;

      const [queueCustomer, previousQueueCustomers] = await Promise.all([
        (async () => {
          if (customer.id) {
            if (queueCustomerData && queueCustomerData.id) {
              const qc = await getQueueCustomerByIdAndCustomer(
                this.cacheManager,
                queueCustomerData.id,
                customer.id,
                dependencies,
              );
              if (qc && String(qc.queue.id) === String(queueId)) {
                return qc;
              }
            }
            if (
              currentlyServedCustomer &&
              String(currentlyServedCustomer.customerId) === String(customer.id)
            ) {
              return currentlyServedCustomer;
            }
            const getwaiting =
              queueCustomerEntityGateway.getWaitingQueueCustomer(
                this.cacheManager,
                queueId,
                customer.id,
                transaction,
                dependencies,
              );
            return getwaiting;
          }
          if (customer.phone && !customer.name) {
            const getwaitingbyPhone = getWaitingQueueCustomerByPhone(
              this.cacheManager,
              queueId,
              customer.phone,
              transaction,
              dependencies,
            );
            return getwaitingbyPhone;
          }
          return null;
        })(),
        currentlyServedCustomer
          ? queueCustomerEntityGateway.getQueueCustomersLeftAfterQueueReset(
              null,
              this.cacheManager,
              queueId,
              queue.resetNumberTime ?? new Date(0),
              currentlyServedCustomer.number,
              dependencies,
            )
          : Promise.resolve([]),
      ]);
      const removeOtherCustomersIds = (
        queueCustomers: IQueueCustomer[],
        myCustomerId: string,
      ) => {
        const isEnqueuedCustomer = (qc: IQueueCustomer) =>
          qc.customerId === myCustomerId;
        return queueCustomers.map(
          (qc) =>
            ({
              ...JSON.parse(JSON.stringify(qc)),
              customerId: isEnqueuedCustomer(qc) ? qc.customerId : undefined,
              customer: qc.customer
                ? {
                    ...qc.customer,
                    id: isEnqueuedCustomer(qc) ? qc.customerId : undefined,
                  }
                : undefined,
            } as IQueueCustomer),
        );
      };

      if (queueCustomer) {
        if (
          queueCustomerData &&
          queueCustomer.notifyUsingSms !== queueCustomerData.notifyUsingSms
        ) {
          await setQueueCustomerNotifyUsingSms(
            this.cacheManager,
            String(queueCustomer.id),
            queueCustomerData.notifyUsingSms,
            dependencies,
          );
        }
        return {
          type: 'already queued',
          data: {
            customerId: queueCustomer.customer.id,
            customerName: queueCustomer.customer.name,
            customerPhone: queueCustomer.customer.phone,
            queueCustomerId: queueCustomer.id,
            queueName: queue.name,
            queueCustomers: removeOtherCustomersIds(
              queue.queueCustomers,
              String(queueCustomer.id),
            ),
            previousQueueCustomers: removeOtherCustomersIds(
              previousQueueCustomers,
              String(queueCustomer.id),
            ),
            queueGroup: queue.queueGroup,
            enqueuedNumber: queueCustomer.number,
            nowServingNumber: currentlyServedCustomer
              ? currentlyServedCustomer.number
              : NaN,
            callTime: queueCustomer.callTime,
            complete: queueCustomer.complete,
          },
        };
      }

      const dbCustomer = await (async () => {
        if (queueCustomer) {
          return queueCustomer.customer;
        }
        if (customer.id) {
          const dbInstance = await Customer.getById(
            this.cacheManager,
            customer.id,
            transaction,
            dependencies,
          );
          if (dbInstance) {
            return dbInstance;
          }
        }
        if (customer.phone && !customer.name) {
          const dbInstance = await Customer.getByPhone(
            this.cacheManager,
            customer.phone,
            transaction,
            dependencies,
          );
          if (dbInstance) {
            return dbInstance;
          }
        }
        return Customer.create(
          this.cacheManager,
          {
            name: customer.name || '',
            phone: customer.phone || '',
            agent: customer.agent,
            ipAddress: customer.ipAddress,
          },
          transaction,
          dependencies,
        );
      })();
      const [createdQueueCustomer] = await Promise.all([
        queueCustomerEntityGateway.createQueueCustomer(
          this.cacheManager,
          {
            ...(queueCustomerData || {}),
            number: queue.nextEnqueueNumber,
            queueId: queue.id,
            customerId: dbCustomer.id,
          },
          transaction,
          dependencies,
          dbCustomer,
        ),
        queueEntityGateway.incrementQueueNextEnqueueNumber(
          this.cacheManager,
          queueId,
          // transaction,
          dependencies,
        ),
      ]);
      if (
        queueCustomerData &&
        queueCustomerData.notifyUsingSms &&
        (customer.phone || dbCustomer.phone)
      ) {
        const customerId = customer.id ? customer.id : dbCustomer.id;
        const url = await queueUtil.createQueueCustomerLink(
          this.cacheManager,
          String(queue.queueGroupId),
          queueId,
          queue.QRId,
          customerId,
          String(createdQueueCustomer.id),
          dependencies,
        );

        const translationARgs = {
          args: {
            name: dbCustomer.name || 'john',
            queueName: queue.name,
            queueGroupName: queue.queueGroup.name,
            number: createdQueueCustomer.number,
            beforeYou: isNaN(queue.queueCustomers.length)
              ? 0
              : queue.queueCustomers.length,
            url,
            // SMSes aren't a vector for XSS/injection, so there's no need to escape the interpolated value
            interpolation: { escapeValue: false },
          },
        };

        await dependencies.sms.sendMessage(
          await i18n.t(
            `test.enqueued.${
              ['Restaurant & Cafe', 'Bar'].includes(queue.queueGroup.type)
                ? 'restaurant'
                : 'default'
            }.sms`,
            translationARgs,
          ),
          customer.phone || dbCustomer.phone,
        );
        console.log('sms now sent!!!!!!!!');
      }

      await Promise.all([
        deferredTask.deferTask(
          'notifyLongWaitingCustomer',
          1000 * 60 * 20,
          String(createdQueueCustomer.id),
        ),
      ]);
      this.logger.log(
        `Broadcasted event queueGroup/${encodeURIComponent(
          queue.queueGroupId,
        )}/queue/${encodeURIComponent(
          queueId,
        )}/joinQuestionaire/customer/${encodeURIComponent(
          createdQueueCustomer.id,
        )}`,
      );
      dependencies.ws.publish(
        `queueGroup/${encodeURIComponent(
          queue.queueGroupId,
        )}/queue/${encodeURIComponent(
          queueId,
        )}/joinQuestionaire/customer/${encodeURIComponent(customer.id)}`,
      );
      dependencies.ws.publish(
        `queueGroup/${encodeURIComponent(
          queue.queueGroupId,
        )}/queue/${encodeURIComponent(queueId)}`,
      );
      this.logger.debug('Finished myMethod');

      return {
        type: 'enqueued',
        data: {
          customerId: dbCustomer.id,
          customerName: dbCustomer.name,
          customerPhone: dbCustomer.phone,
          queueCustomerId: createdQueueCustomer.id,
          queueName: queue.name,
          queueCustomers: [
            ...removeOtherCustomersIds(queue.queueCustomers, dbCustomer.id),
            createdQueueCustomer,
          ],
          previousQueueCustomers: removeOtherCustomersIds(
            previousQueueCustomers,
            dbCustomer.id,
          ),
          queueGroup: queue.queueGroup,
          enqueuedNumber: createdQueueCustomer.number,
          nowServingNumber: currentlyServedCustomer
            ? currentlyServedCustomer.number
            : NaN,
          callTime: createdQueueCustomer.callTime,
          complete: createdQueueCustomer.complete,
        },
      };
    }, dependencies);
  }

  async editCustomer(
    queueId: string,
    queueGroupId: string,
    customerId: string,
    customer: { name?: string; phone?: string },
    queueCustomer: Partial<IQueueCustomer>,
    dependencies: Dependencies = null,
  ) /* : Promise<EditCustomerSuccess | EditCustomerFailure> */ {
    dependencies = injectDependencies(dependencies, ['db', 'ws']);

    const queue = await getQueueWithGroupByWaitingCustomer(
      this.cacheManager,
      queueId,
      queueGroupId,
      customerId,
      dependencies,
    );
    if (!queue) {
      throw new HttpException('not found', HttpStatus.BAD_REQUEST);
    }

    return entityGatewayTransaction.useTransaction(async (transaction) => {
      await Customer.update(
        this.cacheManager,
        customerId,
        {
          ...(customer.name && { name: customer.name }),
          ...(customer.phone && { phone: customer.phone }),
        },
        transaction,
        dependencies,
      );

      if (queueCustomer) {
        await updateQueueCustomer(
          this.cacheManager,
          queueCustomer.id,
          {
            ...(queueCustomer.peopleCount && {
              peopleCount: queueCustomer.peopleCount,
            }),
            ...(queueCustomer.comment && { comment: queueCustomer.comment }),
            ...(queueCustomer.notifyUsingSms && {
              notifyUsingSms: queueCustomer.notifyUsingSms,
            }),
            ...(queueCustomer.areas && { areas: queueCustomer.areas }),
            ...(queueCustomer.traits && { traits: queueCustomer.traits }),
            ...(queueCustomer.complete !== undefined &&
            queueCustomer.complete !== null
              ? { complete: queueCustomer.complete }
              : null),
          },
          transaction,
          dependencies,
        );
      }

      // transaction.afterCommit(() => {
      dependencies.ws.publish(
        `queueGroup/${encodeURIComponent(
          queueGroupId,
        )}/queue/${encodeURIComponent(queueId)}`,
      );
      // });

      // return new EditCustomerSuccess();
    }, dependencies);
  }

  async removeCustomer(
    i18n: I18nContext<Record<string, unknown>>,
    queueId: string,
    queueGroupId: string,
    queueCustomerId: string,
    customerId: string,
    reason: (typeof QueueCustomerLeaveReasons)[number],
    requestingUserEmail: string,
    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db', 'ws']);
    return entityGatewayTransaction.useTransaction(async (transaction) => {
      const [queue, queueCustomer] = await Promise.all([
        queueEntityGateway.getQueueOfQueueGroup(
          this.cacheManager,
          queueId,
          queueGroupId,
          dependencies,
        ),
        queueCustomerEntityGateway.getQueueCustomerByIdAndCustomer(
          this.cacheManager,
          Number(queueCustomerId),
          customerId,
          dependencies,
        ),
      ]);
      if (!queue || !queueCustomer) {
        throw new HttpException('not found', HttpStatus.BAD_REQUEST);
      }

      if (
        reason === 'removed' ||
        reason === 'served' ||
        reason === 'inActive'
      ) {
        if (!requestingUserEmail) {
          return new HttpException('not allowed', HttpStatus.BAD_REQUEST);
        }

        const permission = await QueueGroupUserPermission.ofUserInQueueGroup(
          this.cacheManager,
          String(queue.queueGroup.id),
          requestingUserEmail,
          dependencies,
        );
        if (
          !permission ||
          (!permission.canManageQueue && !permission.isOwner)
        ) {
          throw new HttpException('not allowed', HttpStatus.BAD_REQUEST);
        }
      }

      const isRestaurantOrBar =
        queue.queueGroup &&
        (queue.queueGroup.type === 'Restaurant & Cafe' ||
          queue.queueGroup.type === 'Bar');

      await queueCustomerEntityGateway.removeQueueCustomerFromQueue(
        this.cacheManager,
        String(queueCustomer.id),
        reason,
        transaction,
        dependencies,
      );

      if (reason === 'removed' || reason === 'inActive') {
        await notifier.notify(
          this.cacheManager,
          queueCustomer.customer as any,
          queueCustomer.notifyUsingSms,
          'removedByQueueManager',
          queue.queueGroup.type,
          {
            queueName: queue.name,
            queueGroupName: queue.queueGroup.name,
            customerName: queueCustomer.customer.name,
          },
          {
            queueGroupId,
            queueId,
            QRId: queue.QRId,
            queueCustomerId,
            customerId: queueCustomer.customer.id,
          },
          false,
          dependencies,
          i18n,
        );

        dependencies.ws.publish(
          `queueGroup/${encodeURIComponent(
            queueGroupId,
          )}/queue/${encodeURIComponent(queueId)}/remove/${encodeURIComponent(
            queueCustomerId,
          )}/`,
        );
      }
      if (reason === 'served') {
        if (/* !queueCustomer.callTime && */ isRestaurantOrBar) {
          // await notifyInCaseOfArrival(queueId, queueGroupId, queueCustomerId, queue, queueCustomer, dependencies);
          const updated =
            await queueCustomerEntityGateway.callQueueCustomerThatWasServed(
              this.cacheManager,
              String(queueCustomer.id),
              queueId,
              dependencies,
            );
          // if (!updated) {
          //   return new HttpException(
          //     'failed to update callTime',
          //     HttpStatus.FORBIDDEN,
          //   );
          // }

          await queueEntityGateway.setQueueCurrentlyServedCustomer(
            this.cacheManager,
            queueId,
            queueCustomer.id,
            transaction,
            dependencies,
          );

          dependencies.ws.publish(
            `queueGroup/${encodeURIComponent(
              queueGroupId,
            )}/queue/${encodeURIComponent(
              queueId,
            )}/served/customer/${encodeURIComponent(
              queueCustomer.customer.id,
            )}`,
          );
        }
      }
      dependencies.ws.publish(
        `queueGroup/${encodeURIComponent(
          queueGroupId,
        )}/queue/${encodeURIComponent(queueId)}`,
      );
    }, dependencies);

    // return new RemoveCustomerSuccess();
  }

  /**
   * It's possible that customers joined a queue outside of operating hours. These customers are likely irrelevant.
   * The queue manager (host) wants to be able to remove them from the queue silently (without triggering SMS / push notifications), so that they can start the shift with a clean slate.
   */
  async silentlyRemoveCustomers(
    queueId: string,
    queueGroupId: string,
    requestingUserEmail: string,
    dependencies: Dependencies = null,
  ) /* : Promise<SilentlyRemoveCustomersSuccess | SilentlyRemoveCustomersFailure> */ {
    dependencies = injectDependencies(dependencies, ['db', 'ws']);

    const permission = await QueueGroupUserPermission.ofUserInQueueGroup(
      this.cacheManager,
      queueGroupId,
      requestingUserEmail,
      dependencies,
    );
    if (!permission || (!permission.canManageQueue && !permission.isOwner)) {
      throw new HttpException('not allowed', HttpStatus.BAD_REQUEST);
    }

    const updated =
      await queueCustomerEntityGateway.removeWaitingQueueCustomersFromQueue(
        this.cacheManager,
        queueId,
        'removed',
        dependencies,
      );
    if (!updated) {
      return new HttpException('not found', HttpStatus.BAD_REQUEST);
    }

    dependencies.ws.publish(
      `queueGroup/${encodeURIComponent(
        queueGroupId,
      )}/queue/${encodeURIComponent(queueId)}`,
    );
  }

  async delayCustomerNumber(
    i18n: I18nContext<Record<string, unknown>>,
    queueId: string,
    queueGroupId: string,
    queueCustomerId: string,
    offset: number,
    dependencies: Dependencies = null,
  ) /* : Promise<DelayCustomerNumberSuccess | DelayCustomerNumberFailure>  */ {
    dependencies = injectDependencies(dependencies, ['db', 'ws']);

    if (isNaN(Number(offset))) {
      return Promise.reject(
        new HttpException(
          'delay customer validation failure',
          HttpStatus.BAD_REQUEST,
        ),
      );
    }

    return entityGatewayTransaction.useTransaction(async (transaction) => {
      const [queueCustomer, queue] = await Promise.all([
        getQueueCustomerOfQueue(
          this.cacheManager,
          queueCustomerId,
          queueId,
          transaction,
          dependencies,
        ),
        getQueueForProcessing(
          this.cacheManager,
          queueId,
          transaction,
          dependencies,
        ),
      ]);

      if (!queueCustomer) {
        throw new HttpException('not found', HttpStatus.BAD_REQUEST);
      }

      if (
        queueCustomer.leaveReason === 'served' &&
        queue.currentlyServedQueueCustomerId !== null &&
        queue.currentlyServedQueueCustomerId !== undefined &&
        String(queue.currentlyServedQueueCustomerId) !==
          String(queueCustomer.id)
      ) {
        throw new HttpException('is late', HttpStatus.BAD_REQUEST);
      }

      if (queueCustomer.leaveTime !== null) {
        const nextCustomer = await getNextQueueCustomerOfQueue(
          this.cacheManager,
          Number(queueId),
          transaction,
          dependencies,
        );
        await Promise.all([
          (async () => {
            if (nextCustomer) {
              await removeQueueCustomerFromQueue(
                this.cacheManager,
                String(nextCustomer.id),
                'served',
                transaction,
                dependencies,
              );
            }
          })(),
          setQueueCurrentlyServedCustomer(
            this.cacheManager,
            queueId,
            nextCustomer && nextCustomer.id,
            transaction,
            dependencies,
          ),
        ]);
      }

      // async function updateCustomer(queueCustomer: IQueueCustomer, offset: number): Promise<void> {
      const repository = transaction.getRepository(
        dependencies.db.models.queueCustomer,
      );
      const updateObj: Partial<
        Omit<IQueueCustomer, 'number' | 'snoozeCounter'>
      > & {
        number: any;
        snoozeCounter: any;
      } = {
        number: `"number" + ${Number(offset)}`,
        snoozeCounter: `"snoozeCounter" + 1`,
        // Add any other properties to update here
      };
      await repository.update(queueCustomer.id, updateObj);
      this.cacheManager; //TODO:delete or update item from cache

      // }

      if (queueCustomer.leaveTime) {
        updateObj.leaveTime = null;
        updateObj.leaveReason = null;
      }
      await updateQueueCustomer(
        this.cacheManager,
        Number(queueCustomerId),
        updateObj,
        transaction,
        dependencies,
      );

      await sendNotifications(
        this.cacheManager,
        queueId,
        true,
        transaction,
        i18n,
        dependencies,
      );

      // transaction.afterCommit(() => {
      dependencies.ws.publish(
        `queueGroup/${encodeURIComponent(
          queueGroupId,
        )}/queue/${encodeURIComponent(queueId)}`,
      );
      // });
      // return new DelayCustomerNumberSuccess();
    }, dependencies);
  }

  async notifyCustomerUsingSms(
    queueGroupId: string,
    queueId: string,
    queueCustomerId: string,
    customerId: string,
    dependencies: Dependencies = null,
  ) /* : Promise<NotifyCustomerUsingSmsSuccess | NotifyCustomerUsingSmsFailure>  */ {
    dependencies = injectDependencies(dependencies, ['db']);

    const queueCustomer = await getQueueCustomerOfQueueGroup(
      this.cacheManager,
      Number(queueCustomerId),
      customerId,
      Number(queueId),
      queueGroupId,
      dependencies,
    );

    if (!queueCustomer) {
      throw new HttpException('not found', HttpStatus.BAD_REQUEST);
    }

    await setQueueCustomerNotifyUsingSms(
      this.cacheManager,
      queueCustomerId,
      true,
      dependencies,
    );

    // return new NotifyCustomerUsingSmsSuccess();
  }

  async notifyCustomerUsingPushNotification(
    queueGroupId: string,
    queueId: string,
    queueCustomerId: string,
    customerId: string,
    pushSubscription: PushSubscriptions,
    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db']);
    const queueCustomer = await getQueueCustomerOfQueueGroup(
      this.cacheManager,
      Number(queueCustomerId),
      customerId,
      Number(queueId),
      queueGroupId,
      dependencies,
    );

    if (!queueCustomer) {
      throw new HttpException('not found', HttpStatus.BAD_REQUEST);
    }

    const endpointIv = cryptoUtil.createIv();
    const p256dhIv = cryptoUtil.createIv();
    const authIv = cryptoUtil.createIv();
    const encoder = new TextDecoder('utf-8');
    // const p256dhBuffer = new Uint8Array(
    //   Buffer.from(pushSubscription.p256dhKey, 'base64'),
    // );
    // const authBuffer = new Uint8Array(
    //   Buffer.from(pushSubscription.authKey, 'base64'),
    // );
    await Customer.update(
      this.cacheManager,
      customerId,
      {
        vapidEndpoint: cryptoUtil.encrypt(
          pushSubscription.endpoint,
          vapidEncryptionKey,
          endpointIv,
        ),
        vapidEndpointIv: endpointIv,
        vapidP256dh: cryptoUtil.encrypt(
          pushSubscription.p256dhKey,
          vapidEncryptionKey,
          p256dhIv,
        ),
        vapidP256dhIv: p256dhIv,
        vapidAuth: cryptoUtil.encrypt(
          pushSubscription.authKey,
          vapidEncryptionKey,
          authIv,
        ),
        vapidAuthIv: authIv,
      },
      null,
      dependencies,
    );

    // return new NotifyCustomerUsingPushNotificationSuccess();
  }

  async callCustomer(
    i18n: I18nContext<Record<string, unknown>>,
    queueGroupId: string,
    queueId: string,
    queueCustomerId: string,
    requestingUserEmail: string,
    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db', 'ws']);
    return useTransaction(async (transaction) => {
      const permission = await QueueGroupUserPermission.ofUserInQueueGroup(
        this.cacheManager,
        queueGroupId,
        requestingUserEmail,
        dependencies,
      );
      if (!permission || (!permission.canManageQueue && !permission.isOwner)) {
        throw new HttpException('not allowed', HttpStatus.BAD_REQUEST);
      }

      const queue = await queueEntityGateway.getQueueOfQueueGroup(
        this.cacheManager,
        queueId,
        queueGroupId,
        dependencies,
      );
      if (!queue) {
        throw new HttpException('not found', HttpStatus.BAD_REQUEST);
      }

      const queueCustomer =
        await queueCustomerEntityGateway.getQueueCustomerOfQueue(
          this.cacheManager,
          queueCustomerId,
          queueId,
          null,
          dependencies,
        );
      if (!queueCustomer) {
        throw new HttpException('not found', HttpStatus.BAD_REQUEST);
      }

      await this.notifyInCaseOfArrival(
        i18n,
        queueId,
        queueGroupId,
        queueCustomerId,
        queue,
        queueCustomer,
        dependencies,
      );

      if (!queueCustomer.callTime) {
        const updated = await queueCustomerEntityGateway.callQueueCustomer(
          this.cacheManager,
          queueCustomerId,
          queueId,
          transaction,
          dependencies,
        );
        if (!updated) {
          throw new HttpException('not found', HttpStatus.BAD_REQUEST);
        }
        this.logger.log(
          `Broadcasted event queueGroup/${encodeURIComponent(
            queueGroupId,
          )}/queue/${encodeURIComponent(
            queueId,
          )}/call/customer/${encodeURIComponent(queueCustomer.customer.id)}`,
        );
        dependencies.ws.publish(
          `queueGroup/${encodeURIComponent(
            queueGroupId,
          )}/queue/${encodeURIComponent(
            queueId,
          )}/call/customer/${encodeURIComponent(queueCustomer.customer.id)}`,
        );
        dependencies.ws.publish(
          `queueGroup/${encodeURIComponent(
            queueGroupId,
          )}/queue/${encodeURIComponent(queueId)}`,
        );
      }
    }, dependencies);

    // return new CallCustomerSuccess();
  }

  async restoreCustomer(
    i18n: I18nContext<Record<string, unknown>>,
    queueGroupId: string,
    queueId: string,
    queueCustomerId: string,
    customerId: string,
    requestingUserEmail: string,
    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db', 'ws']);
    if (customerId) {
      // If we have customerId, customer tries to return themselves to the queue
      if (!queueCustomerId) {
        const lastQueueCustomer =
          await queueCustomerEntityGateway.getLastQueueCustomerOfCustomerInQueue(
            this.cacheManager,
            queueId,
            customerId,
            dependencies,
          );
        if (!lastQueueCustomer) {
          throw new HttpException('not found', HttpStatus.BAD_REQUEST);
        }
        queueCustomerId = String(lastQueueCustomer.id);
      }
    } else {
      // If we don't have customerId, someone else tries to return the customer to the queue
      if (!requestingUserEmail || !queueCustomerId) {
        throw new HttpException('not allowed', HttpStatus.BAD_REQUEST);
      }
      const permission = await QueueGroupUserPermission.ofUserInQueueGroup(
        this.cacheManager,
        queueGroupId,
        requestingUserEmail,
        dependencies,
      );
      if (!permission || (!permission.canManageQueue && !permission.isOwner)) {
        throw new HttpException('not allowed', HttpStatus.BAD_REQUEST);
      }
    }
    await queueEntityGateway.resetQueueCurrentlyServedCustomer(
      this.cacheManager,
      queueId,
      null,
      dependencies,
    );
    const updated = await queueCustomerEntityGateway.returnQueueCustomerToQueue(
      this.cacheManager,
      customerId,
      queueCustomerId,
      hoursToMilliseconds(24),
      null,
      dependencies,
    );
    if (!updated) {
      return new HttpException('expired', HttpStatus.BAD_REQUEST);
    }
    const [queue, queueCustomer] = await Promise.all([
      queueEntityGateway.getQueueOfQueueGroup(
        this.cacheManager,
        queueId,
        queueGroupId,
        dependencies,
      ),
      queueCustomerEntityGateway.getQueueCustomerOfQueue(
        this.cacheManager,
        queueCustomerId,
        queueId,
        null,
        dependencies,
      ),
    ]);

    const url = await queueUtil.createQueueCustomerLink(
      this.cacheManager,
      queueGroupId,
      queueId,
      queue.QRId,
      queueCustomer.customerId,
      queueCustomerId,
      dependencies,
    );

    await notifier.notify(
      this.cacheManager,
      queueCustomer.customer,
      queueCustomer.notifyUsingSms,
      'restoredAcknowledgement',
      queue.queueGroup.type,
      {
        queueName: queue.name,
        queueGroupName: queue.queueGroup.name,
        customerName: queueCustomer.customer.name,
        url,
      },
      {
        queueGroupId,
        queueId,
        QRId: queue.QRId,
        queueCustomerId,
        customerId: queueCustomer.customerId,
      },
      true,
      dependencies,
      i18n,
      queueCustomer.leaveReason,
    );
    await notifier.notify(
      this.cacheManager,
      queueCustomer.customer,
      queueCustomer.notifyUsingSms,
      'restoredAcknowledgement',
      queue.queueGroup.type,
      { url },
      { queueGroupId, queueId, QRId: queue.QRId },
      false,
      dependencies,
      i18n,
    );

    dependencies.ws.publish(
      `queueGroup/${encodeURIComponent(
        queueGroupId,
      )}/queue/${encodeURIComponent(queueId)}`,
    );
    console.log(
      `Broadcasted event queueGroup/${encodeURIComponent(
        queueGroupId,
      )}/queue/${encodeURIComponent(queueId)}/restore/${encodeURIComponent(
        queueCustomerId,
      )}`,
    );
    dependencies.ws.publish(
      `queueGroup/${encodeURIComponent(
        queueGroupId,
      )}/queue/${encodeURIComponent(queueId)}/restore/${encodeURIComponent(
        queueCustomerId,
      )}`,
    );

    // return new RestoreCustomerSuccess();
  }

  async confirmCustomerComing(
    queueGroupId: string,
    queueCustomerId: string,
    customerId: string,
    queueId: string,
    dependencies: Dependencies = null,
  ) /* : Promise<ConfirmCustomerComingSuccess | ConfirmCustomerComingFailure> */ {
    dependencies = injectDependencies(dependencies, ['db', 'ws']);

    const updated =
      await queueCustomerEntityGateway.updateQueueCustomerOfCustomerAndQueueGroup(
        this.cacheManager,
        Number(queueCustomerId),
        customerId,
        Number(queueId),
        { confirmed: true },
        dependencies,
      );
    if (!updated) {
      throw new HttpException('not found', HttpStatus.BAD_REQUEST);
    }

    dependencies.ws.publish(
      `queueGroup/${encodeURIComponent(
        queueGroupId,
      )}/queue/${encodeURIComponent(queueId)}`,
    );

    // return new ConfirmCustomerComingSuccess();
  }

  async getQueueCustomersRemoved(
    queueId: string,
    queueGroupId: string,
    requestingUserEmail: string,
    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db', 'ws']);

    const permission = await QueueGroupUserPermission.ofUserInQueueGroup(
      this.cacheManager,
      queueGroupId,
      requestingUserEmail,
      dependencies,
    );

    if (!permission || !(permission.isOwner || permission.canManageQueue)) {
      throw new HttpException('not allowed', HttpStatus.BAD_REQUEST);
    }

    const queue = await queueEntityGateway.getQueueOfQueueGroup(
      this.cacheManager,
      queueId,
      queueGroupId,
      dependencies,
    );
    if (!queue) {
      throw new HttpException('not found', HttpStatus.BAD_REQUEST);
    }

    if (
      queue.queueGroup.type !== 'Restaurant & Cafe' &&
      queue.queueGroup.type !== 'Bar'
    ) {
      throw new HttpException(
        'not the right queuegroup type',
        HttpStatus.BAD_REQUEST,
      );
    }

    const removedQueueCustomers =
      await queueCustomerEntityGateway.getQueueCustomersLeftAfterQueueReset(
        null,
        this.cacheManager,
        queueId,
        queue.resetNumberTime ?? new Date(0),
        null,
        dependencies,
      );

    return removedQueueCustomers;
  }

  async notifyLongWaitingCustomer(
    i18n: I18nContext<Record<string, unknown>>,
    queueCustomerId: string,
    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db', 'push', 'sms']);

    const queueCustomer =
      await queueCustomerEntityGateway.getWaitingQueueCustomerWithCustomerQueueAndQueueGroup(
        this.cacheManager,
        queueCustomerId,
        dependencies,
      );
    if (!queueCustomer) {
      throw new HttpException('not found', HttpStatus.BAD_REQUEST);
    }

    await notifier.notify(
      this.cacheManager,
      queueCustomer.customer,
      queueCustomer.notifyUsingSms,
      'longWaitingAcknowledgement',
      queueCustomer.queue.queueGroup.type,
      { customerName: queueCustomer.customer.name },
      {
        queueGroupId: queueCustomer.queue.queueGroupId,
        queueId: queueCustomer.queueId,
      },
      false,
      dependencies,
      i18n,
      queueCustomer.leaveReason,
    );
  }
  async addToCart(
    product: IAdvertisement[],
    totalPrice: number,
    orderPlaced: boolean,
    queueCustomerId: string,
    queueGroupId: string,
    queueId: string,
    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db', 'ws']);

    return useTransaction(async (transaction) => {
      await queueCustomerEntityGateway.addToCart(
        product,
        totalPrice,
        orderPlaced,
        queueCustomerId,
        transaction,
        dependencies,
      );
      dependencies.ws.publish(
        `queueGroup/${encodeURIComponent(
          queueGroupId,
        )}/queue/${encodeURIComponent(queueId)}`,
      );
    }, dependencies);
  }
  async getCartItems(
    queueCustomerId: string,
    queueGroupId: string,
    queueId: string,
    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db', 'ws']);

    return useTransaction(async (transaction) => {
      await queueCustomerEntityGateway.getCartitems(
        queueCustomerId,
        transaction,
        dependencies,
      );
      dependencies.ws.publish(
        `queueGroup/${encodeURIComponent(
          queueGroupId,
        )}/queue/${encodeURIComponent(queueId)}`,
      );
    }, dependencies);
  }
  async updateCartItems(
    complete: boolean,
    requestingUserEmail: string,
    cartId: string,
    queueGroupId: string,
    queueId: string,

    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db', 'ws']);
    dependencies = injectDependencies(dependencies, ['db', 'ws']);

    const permission = await QueueGroupUserPermission.ofUserInQueueGroup(
      this.cacheManager,
      queueGroupId,
      requestingUserEmail,
      dependencies,
    );
    console.log(permission, requestingUserEmail, 'this is the email');
    if (!permission || !(permission.isOwner || permission.canManageQueue)) {
      throw new HttpException('not allowed', HttpStatus.BAD_REQUEST);
    }

    return useTransaction(async (transaction) => {
      await queueCustomerEntityGateway.updateCartitems(
        complete,
        cartId,
        transaction,
        dependencies,
      );
      dependencies.ws.publish(
        `queueGroup/${encodeURIComponent(
          queueGroupId,
        )}/queue/${encodeURIComponent(queueId)}`,
      );
    }, dependencies);
  }
  async deleteCartItems(
    requestingUserEmail: string,
    cartId: number,
    cartItemId: number,
    queueGroupId: string,
    queueId: string,

    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db', 'ws']);
    dependencies = injectDependencies(dependencies, ['db', 'ws']);

    const permission = await QueueGroupUserPermission.ofUserInQueueGroup(
      this.cacheManager,
      queueGroupId,
      requestingUserEmail,
      dependencies,
    );

    if (!permission || !(permission.isOwner || permission.canManageQueue)) {
      throw new HttpException('not allowed', HttpStatus.BAD_REQUEST);
    }

    return useTransaction(async (transaction) => {
      await queueCustomerEntityGateway.deleteCartitems(
        cartId,
        cartItemId,
        transaction,
        dependencies,
      );
      // dependencies.ws.publish(
      //   `queueGroup/${encodeURIComponent(
      //     queueGroupId,
      //   )}/queue/${encodeURIComponent(queueId)}`,
      // );
    }, dependencies);
  }
}
