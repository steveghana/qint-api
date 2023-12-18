import { Dependencies, injectDependencies } from '../dependencyInjector';
import { ExpiredOrInvalidSubscriptionError } from '../push';
import logger from '../log';
import languageUtil from '../../util/language';
import cryptoUtil from '../crypto';
import hebrewSmsLocalization from '../../util/locale/he.json';
import Customer from '../../customer/src/services/customer/Entity/customer';
import { IQueueGroupType } from '../../types/queueGroup';
import { Cache } from 'cache-manager';
import { I18nContext, I18nService } from 'nestjs-i18n';
void languageUtil.initialize();

export const vapidEncryptionKey =
  process.env.BUILD_ENV === 'production'
    ? process.env.VAPID_ENCRYPTION_KEY
    : '................................';

type LocalizedMessageKey = keyof typeof hebrewSmsLocalization;

async function notify(
  cacheManager: Cache,
  customer: {
    id?: string;
    vapidEndpoint?: string;
    vapidEndpointIv?: string;
    vapidP256dh?: string;
    vapidP256dhIv?: string;
    vapidAuth?: string;
    vapidAuthIv?: string;
    phone?: string;
  },
  notifyUsingSms: boolean,
  messageKey: LocalizedMessageKey,
  queueGroupType: IQueueGroupType,
  interpolation: Record<string, any>,
  data: Record<string, any>,
  isHighPriority: boolean,
  dependencies: Dependencies = null,
  i18n?: I18nContext<Record<string, unknown>>,
  leaveReason?:
    | 'served'
    | 'quit'
    | 'removed'
    | 'expired'
    | 'inActive'
    | 'delete',
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['sms', 'push']);
  if (!customer) {
    throw new Error("Can't notify nonexistant customer");
  }
  if (
    leaveReason === 'quit' ||
    leaveReason === 'removed' ||
    leaveReason === 'served'
  ) {
    return;
  }
  // We prefer push notifications if possible because they're cheaper
  let sentPushNotification = false;
  if (customer.vapidEndpoint) {
    try {
      await dependencies.push.send(
        {
          endpoint: cryptoUtil.decrypt(
            customer.vapidEndpoint,
            vapidEncryptionKey,
            customer.vapidEndpointIv,
          ),
          keys: {
            p256dh: cryptoUtil.decrypt(
              customer.vapidP256dh,
              vapidEncryptionKey,
              customer.vapidP256dhIv,
            ),
            auth: cryptoUtil.decrypt(
              customer.vapidAuth,
              vapidEncryptionKey,
              customer.vapidAuthIv,
            ),
          },
        },
        {
          messageKey,
          queueGroupType,
          interpolation,
          data,
        },
        {
          headers: {
            /* Push notification latency is best-effort, so they may get delayed.
             * Delay can happen because of the Push Service, deferring processing to do it in bulk.
             * Delay can happen because of the Client, deferring processing due to low battery.
             * To eliminate some delays, we can specify urgency.
             * If Urgency=high, the system checks if the user interacts with the push. If they don't,
             * the system may decide to disrespect the urgency in the future.
             * References:
             * https://datatracker.ietf.org/doc/html/draft-ietf-webpush-protocol#section-5.3
             * https://developers.google.com/web/fundamentals/push-notifications/web-push-protocol#urgency
             */
            Urgency: isHighPriority ? 'high' : 'normal',
          },
        },
      );
      sentPushNotification = true;
      console.log('push now sent');
    } catch (err) {
      if (err instanceof ExpiredOrInvalidSubscriptionError) {
        // If push subscription is expired, we want to remove it from the database
        if (customer.id !== undefined && customer.id !== null) {
          await Customer.update(
            cacheManager,
            customer.id,
            {
              vapidEndpoint: '',
              vapidEndpointIv: '',
              vapidP256dh: '',
              vapidP256dhIv: '',
              vapidAuth: '',
              vapidAuthIv: '',
            },
            null,
            dependencies,
          );
        }
      } else {
        logger.error('push', 'Failed to send a push notification', [err]);
      }
    }
  }
  // If we can't do a push notification, we'll send an SMS if we can
  if (!sentPushNotification && notifyUsingSms && customer.phone) {
    const translationARgs = {
      args: {
        ...interpolation,
        // SMSes aren't a vector for XSS/injection, so there's no need to escape the interpolated value
        interpolation: { escapeValue: false },
      },
    };
    // const t = await languageUtil.getStaticTranslationNamespace(
    //   'sms',
    //   hebrewSmsLocalization,
    // );
    // TO Do update language trans dynamically to he / en
    // await dependencies.sms.sendMessage(
    //   await i18n.translate(
    //     `test.${messageKey}.${
    //       ['Restaurant & Cafe', 'Bar'].includes(queueGroupType)
    //         ? 'restaurant'
    //         : 'default'
    //     }.sms`,
    //     translationARgs,
    //   ),
    //   customer.phone,
    // );
  }
}

export default {
  notify,
};
