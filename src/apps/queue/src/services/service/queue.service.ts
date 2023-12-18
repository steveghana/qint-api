// import { ResultBoundary } from '../..';
import {
  Dependencies,
  injectDependencies,
} from '../../../../util/dependencyInjector';
import { IQueue, IProcessedQueue } from '../../../../types/queue';
import { IQueueCustomer } from '../../../../types/queueCustomer';
import { sendNotifications } from './util';
import cryptoUtil from '../../../../util/crypto';

// import { generateAlphanumeric } from '../../../../web/util/id';
import User from '../../../../auth/src/services/userEntity';

import {
  createQueue,
  destroyQueue,
  getQueueForProcessing,
  resetQueueNextEnqueueNumber,
  setQueueCurrentlyServedCustomer,
  updateIsCustomDisplay,
  // updateQRId,
} from '../DBGateway/queue';
import {
  getNextQueueCustomerOfQueue,
  getPreviousQueueCustomerOfQueue,
  getQueueCustomersLeftAfterQueueReset,
  removeQueueCustomerFromQueue,
  returnQueueCustomerToQueue,
} from '../../../../customer/src/services/QueueCustomer/DBGateway/queueGroupEntityGateway';
import { useTransaction } from '../../../../Config/transaction';
import QueueGroupUserPermission from '../../../../business/src/services/Permissions/Entity/queueGroupUserPermission';
import QueueGroup from '../../../../business/src/services/Root/Entity/queueGroup';
import { Injectable } from '@nestjs/common/decorators';
import {
  HttpException,
  HttpStatus,
  Inject,
  CACHE_MANAGER,
  Next,
} from '@nestjs/common';
import entityGatewayTransaction from '../../../../util/transaction';
import { Cache } from 'cache-manager';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class QueueService {
  constructor(
    private readonly i18n: I18nService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(
    name: string,
    queueGroupId: string,
    requestingUserEmail: string,
    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db']);
    return entityGatewayTransaction.useTransaction(async (transaction) => {
      console.log('entered queueId');

      const queueGroup = await QueueGroup.getById(
        this.cacheManager,
        queueGroupId,
        transaction,
        dependencies,
      );
      if (!queueGroup) {
        throw new HttpException('no queueGroup', HttpStatus.NOT_FOUND);
      }

      const permission = (queueGroup.permissions || []).find(
        (p: any) => p.userEmail === requestingUserEmail,
      );
      if (!permission || !permission.isOwner) {
        throw new HttpException('not the owner', HttpStatus.NOT_FOUND);
      }

      const queue = await createQueue(
        this.cacheManager,

        {
          name: name,
          queueGroupId: Number(queueGroup.id),
        },
        transaction,
        dependencies,
      );

      return String(queue.id);
    }, dependencies);
  }

  async getAllInGroup(queueGroupId: string, dependencies: Dependencies = null) {
    dependencies = injectDependencies(dependencies, ['db']);
    return entityGatewayTransaction.useTransaction(async (transaction) => {
      const queueGroup = await QueueGroup.getById(
        this.cacheManager,

        queueGroupId,

        transaction,
        dependencies,
      );

      if (!queueGroup) {
        throw new HttpException('no business', HttpStatus.NOT_FOUND);
      }

      const queues: IQueue[] = queueGroup.queues;
      if (queues.length === 0) {
        throw new HttpException('no queues available', HttpStatus.NOT_FOUND);
      }

      return queues;
    }, dependencies);
  }

  async getById(
    queueId: string,
    requestingCustomerId: string,
    requestingUserEmail: string,
    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db']);
    return entityGatewayTransaction.useTransaction(async (transaction) => {
      const queue = await getQueueForProcessing(
        this.cacheManager,
        queueId,
        transaction,
        dependencies,
      );

      if (!queue) {
        throw new HttpException('no found', HttpStatus.NOT_FOUND);
      }

      const hasAccessToAllCustomerIds = await (async () => {
        if (!requestingUserEmail) {
          return false;
        }
        const permission = await QueueGroupUserPermission.ofUserInQueueGroup(
          this.cacheManager,
          String(queue.queueGroup.id),
          requestingUserEmail,
          dependencies,
        );
        return permission && (permission.isOwner || permission.canManageQueue);
      })();

      const currentCustomer = queue.currentlyServedQueueCustomer;

      const previousQueueCustomers = currentCustomer
        ? await getQueueCustomersLeftAfterQueueReset(
            transaction,
            this.cacheManager,
            queueId,
            queue.resetNumberTime ?? new Date(0),
            currentCustomer.number,
            dependencies,
          )
        : [];
      const processedQueue = JSON.parse(JSON.stringify(queue));
      processedQueue.currentCustomer =
        currentCustomer && JSON.parse(JSON.stringify(currentCustomer));

      processedQueue.nowServingNumber = currentCustomer
        ? currentCustomer.number
        : NaN;
      processedQueue.previousQueueCustomers = previousQueueCustomers.map((qc) =>
        JSON.parse(JSON.stringify(qc)),
      );
      if (!hasAccessToAllCustomerIds) {
        if (
          processedQueue.currentCustomer &&
          processedQueue.currentCustomer.customerId !== requestingCustomerId
        ) {
          processedQueue.currentCustomer.customerId = undefined;
          if (processedQueue.currentCustomer) {
            processedQueue.currentCustomer.customer.id = undefined;
          }
        }
        [
          ...processedQueue.previousQueueCustomers,
          ...processedQueue.queueCustomers,
        ].forEach((queueCustomer) => {
          if (queueCustomer.customerId !== requestingCustomerId) {
            queueCustomer.customerId = undefined;
            if (queueCustomer.customer) {
              queueCustomer.customer.id = undefined;
            }
          }
        });
      }
      return processedQueue;
    }, dependencies);
  }

  destroy(
    queueId: string,
    queueGroupId: string,
    requestingUserEmail: string,
    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db']);

    return useTransaction(async (transaction) => {
      const queueGroup = await QueueGroup.getById(
        this.cacheManager,
        queueGroupId,
        transaction,
        dependencies,
      );

      if (!queueGroup) {
        throw new HttpException('no found', HttpStatus.NOT_FOUND);
      }

      const queue = queueGroup.queues.find(
        (q: any) => String(q.id) === String(queueId),
      );
      if (!queue) {
        throw new HttpException('no found', HttpStatus.NOT_FOUND);
      }

      const permission = (queueGroup.permissions || []).find(
        (p: any) => p.userEmail === requestingUserEmail,
      );
      if (!permission || !permission.isOwner) {
        throw new HttpException('not owner', HttpStatus.FORBIDDEN);
      }

      await destroyQueue(this.cacheManager, queueId, dependencies);
      // return new DestroySuccess();
    }, dependencies);
  }

  callNext(
    i18n: I18nContext<Record<string, unknown>>,

    queueId: string,
    queueGroupId: string,
    requestingUserEmail: string,
    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db', 'ws']);

    return useTransaction(async (transaction) => {
      const queueGroup = await QueueGroup.getById(
        this.cacheManager,
        queueGroupId,
        transaction,
        dependencies,
      );

      if (!queueGroup) {
        throw new HttpException('no found', HttpStatus.NOT_FOUND);
      }

      const queue = queueGroup.queues.find(
        (q: any) => String(q.id) === String(queueId),
      );
      if (!queue) {
        throw new HttpException('no found', HttpStatus.NOT_FOUND);
      }

      const permission = (queueGroup.permissions || []).find(
        (p: any) => p.userEmail === requestingUserEmail,
      );
      if (!permission || !(permission.isOwner || permission.canManageQueue)) {
        throw new HttpException('no allowed', HttpStatus.FORBIDDEN);
      }

      // Unfortunately, Sequelize doesn't support `order` in an `update` query, so we can't do it in one query
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
      if (nextCustomer) {
        await sendNotifications(
          this.cacheManager,
          queueId,
          true,
          transaction,
          i18n,
          dependencies,
        );
      }

      // transaction.afterCommit(() => {
      dependencies.ws.publish(
        `queueGroup/${encodeURIComponent(
          queueGroupId,
        )}/queue/${encodeURIComponent(
          queueId,
        )}/callnext/customer/${encodeURIComponent(nextCustomer.id)}`,
      );
      // });

      // return new CallNextSuccess();
    }, dependencies);
  }

  callAgain(
    i18n: I18nContext<Record<string, unknown>>,

    queueId: string,
    queueGroupId: string,
    requestingUserEmail: string,
    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db', 'ws']);

    return useTransaction(async (transaction) => {
      const queueGroup = await QueueGroup.getById(
        this.cacheManager,
        queueGroupId,
        transaction,
        dependencies,
      );

      if (!queueGroup) {
        throw new HttpException('no found', HttpStatus.NOT_FOUND);
      }

      const queue = queueGroup.queues.find(
        (q: any) => String(q.id) === String(queueId),
      );
      if (!queue) {
        throw new HttpException('no found', HttpStatus.NOT_FOUND);
      }

      const permission = (queueGroup.permissions || []).find(
        (p: any) => p.userEmail === requestingUserEmail,
      );
      if (!permission || !(permission.isOwner || permission.canManageQueue)) {
        throw new HttpException('no found', HttpStatus.NOT_FOUND);
      }
      const nextCustomer = await getNextQueueCustomerOfQueue(
        this.cacheManager,
        Number(queueId),
        transaction,
        dependencies,
      );
      await sendNotifications(
        this.cacheManager,
        queueId,
        false,
        transaction,
        i18n,

        dependencies,
      );

      // transaction.afterCommit(() => {
      dependencies.ws.publish(
        `queueGroup/${encodeURIComponent(
          queueGroupId,
        )}/queue/${encodeURIComponent(
          queueId,
        )}/callAgain/customer/${encodeURIComponent(nextCustomer.id)}`,
      );
      // });

      // return new CallAgainSuccess();
    }, dependencies);
  }

  callPrevious(
    i18n: I18nContext<Record<string, unknown>>,

    queueId: string,
    queueGroupId: string,
    requestingUserEmail: string,
    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db', 'ws']);

    return useTransaction(async (transaction) => {
      const queueGroup = await QueueGroup.getById(
        this.cacheManager,
        queueGroupId,
        transaction,
        dependencies,
      );

      if (!queueGroup) {
        throw new HttpException('not found', HttpStatus.NOT_FOUND);
      }

      const queue = queueGroup.queues.find(
        (q: any) => String(q.id) === String(queueId),
      );
      if (!queue) {
        throw new HttpException('not found', HttpStatus.NOT_FOUND);
      }

      const permission = (queueGroup.permissions || []).find(
        (p: any) => p.userEmail === requestingUserEmail,
      );
      if (!permission || !(permission.isOwner || permission.canManageQueue)) {
        throw new HttpException('not allowed', HttpStatus.FORBIDDEN);
      }

      const previousQueueCustomer = await getPreviousQueueCustomerOfQueue(
        this.cacheManager,
        Number(queueId),
        String(queue.currentlyServedQueueCustomerId),
        transaction,
        dependencies,
      );

      const promises: Promise<any>[] = [];
      if (previousQueueCustomer) {
        promises.push(
          ...[
            setQueueCurrentlyServedCustomer(
              this.cacheManager,
              queueId,
              previousQueueCustomer.id,
              transaction,
              dependencies,
            ),
            removeQueueCustomerFromQueue(
              this.cacheManager,
              String(previousQueueCustomer.id),
              'served',
              transaction,
              dependencies,
            ),
          ],
        );
      }

      if (queue.currentlyServedQueueCustomerId) {
        if (!previousQueueCustomer) {
          promises.push(
            setQueueCurrentlyServedCustomer(
              this.cacheManager,
              queueId,
              null,
              transaction,
              dependencies,
            ),
          );
        }

        promises.push(
          returnQueueCustomerToQueue(
            this.cacheManager,
            null,
            String(queue.currentlyServedQueueCustomerId),
            NaN,
            transaction,
            dependencies,
          ),
        );
      }

      await Promise.all(promises);

      await sendNotifications(
        this.cacheManager,
        queueId,
        false,
        transaction,
        i18n,

        dependencies,
      );

      // transaction.afterCommit(() => {
      dependencies.ws.publish(
        `queueGroup/${encodeURIComponent(
          queueGroupId,
        )}/queue/${encodeURIComponent(
          queueId,
        )}/callprevious/customer/${encodeURIComponent(
          previousQueueCustomer.id,
        )}`,
      );
      // });
      // return new CallPreviousSuccess();
    }, dependencies);
  }

  resetNumbers(
    queueId: string,
    queueGroupId: string,
    requestingUserEmail: string,
    dependencies: Dependencies = null,
  ) {
    dependencies = injectDependencies(dependencies, ['db', 'ws']);

    return useTransaction(async (transaction) => {
      const queueGroup = await QueueGroup.getById(
        this.cacheManager,
        queueGroupId,
        transaction,
        dependencies,
      );

      if (!queueGroup) {
        throw new HttpException('not found', HttpStatus.NOT_FOUND);
      }

      const queue = queueGroup.queues.find(
        (q: any) => String(q.id) === String(queueId),
      );
      if (!queue) {
        throw new HttpException('not found', HttpStatus.NOT_FOUND);
      }

      const permission = (queueGroup.permissions || []).find(
        (p: any) => p.userEmail === requestingUserEmail,
      );
      if (!permission || !(permission.isOwner || permission.canManageQueue)) {
        throw new HttpException('not allowed', HttpStatus.FORBIDDEN);
      }

      await resetQueueNextEnqueueNumber(
        this.cacheManager,
        queueId,
        transaction,
        dependencies,
      );

      // transaction.afterCommit(() => {
      dependencies.ws.publish(
        `queueGroup/${encodeURIComponent(
          queueGroupId,
        )}/queue/${encodeURIComponent(queueId)}`,
      );
      // });

      // return new ResetNumbersSuccess();
    }, dependencies);
  }

  async checkoutTable(
    queueId: string,
    queueGroupId: string,
    table: { tableId: string; peopleCount: number },
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
      if (!permission || (!permission.isOwner && !permission.canManageQueue)) {
        throw new HttpException('not allowed', HttpStatus.FORBIDDEN);
      }

      dependencies.ws.publish(
        `queueGroup/${encodeURIComponent(
          queueGroupId,
        )}/queue/${encodeURIComponent(
          queueId,
        )}/table-checkout/table/${encodeURIComponent(table.tableId)}`,
        { tableId: table.tableId, peopleCount: table.peopleCount },
      );
    }, dependencies);

    // return new CheckoutTableSuccess();
  }

  async updateQueueQRId(
    queueId: string,
    queueGroupId: string,
    password: string,
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
      if (!permission || (!permission.isOwner && !permission.canManageQueue)) {
        throw new HttpException('not allowed', HttpStatus.FORBIDDEN);
      }

      dependencies = injectDependencies(dependencies, ['db', 'config']);
      const user = new User(requestingUserEmail, dependencies);
      const exists = await user.exists();
      /**
       * Here we want to protect against a timing attack: https://en.wikipedia.org/wiki/Timing_attack
       * We don't want an attacker to know whether the user doesn't exist or the password is wrong.
       * For that we must do approximately the same amount of work on both execution branches, so the timing is equal.
       * If the user exists and has a password we hash and compare the password, which is relatively computationally expensive,
       * so we must do something equally expensive if the user doesn't exist.
       * We hash and compare to a fake password for that reason.
       */

      /* Reference Login interactor */
      const fakePassword = await cryptoUtil.hash(
        '',
        dependencies.config.authentication.passwordHashIterations,
      );
      const passwordMatches = await (exists
        ? user.passwordMatches(password)
        : cryptoUtil.compare('', fakePassword));
      const passwordIsEmpty = await (exists
        ? user.passwordMatches('')
        : cryptoUtil.compare('', fakePassword));

      if (exists && passwordIsEmpty) {
        throw new HttpException('not allowed', HttpStatus.FORBIDDEN);
      }
      // We want to protect against a user enumeration attack.
      // That's why we want to behave the same whether the user exists or the password is wrong.
      // https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/03-Identity_Management_Testing/04-Testing_for_Account_Enumeration_and_Guessable_User_Account

      /* Reference Login interactor */

      if (!exists || (exists && !passwordMatches)) {
        throw new HttpException('not allowed', HttpStatus.FORBIDDEN);
      }

      if (await user.isLocked()) {
        throw new HttpException('not allowed', HttpStatus.FORBIDDEN);
      }
    }, dependencies);

    // const QRId = generateAlphanumeric(4);
    // await updateQRId(queueId, QRId);
    // return new UpdateQRIdSuccess();
  }

  async updateQueueDisplay(
    queueId: string,
    queueGroupId: string,
    isCustomDisplay: boolean,
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
      if (!permission || (!permission.isOwner && !permission.canManageQueue)) {
        throw new HttpException('not allowed', HttpStatus.FORBIDDEN);
      }
      // saving the update into the database
      await updateIsCustomDisplay(
        this.cacheManager,
        queueGroupId,
        isCustomDisplay,
        transaction,
        dependencies,
      );

      // TODO: save in the database
      dependencies.ws.publish(
        `queueGroup/${encodeURIComponent(
          queueGroupId,
        )}/queue/${encodeURIComponent(queueId)}`,
      );
    }, dependencies);

    // return new UpdateIsCustomDisplaySuccess();
  }
}
