// import { setVapidDetails, sendNotification } from 'web-push';
import * as webPush from 'web-push';
import logger from '../log';

function getVapidPublicKey(): string {
  if (process.env.BUILD_ENV === 'production') {
    return process.env.VAPID_PUBLIC_KEY;
  }
  return (
    process.env.VAPID_PUBLIC_KEY ||
    'BEUxXv--MBnGeQuSbtEflfRVyrwD2WRyplcNEpCOS1v4UgFBA8Lk2S3_8NPObC8SUDHqvMNaDjs8TpMDggSzbVk'
  );
}

function getVapidPrivateKey(): string {
  if (process.env.BUILD_ENV === 'production') {
    return process.env.VAPID_PRIVATE_KEY;
  }
  return (
    process.env.VAPID_PRIVATE_KEY ||
    'XW0fP3dGVRpWYSef-_q1pi_p1mV9ID80PtoKMHv1c5g'
  );
}

function init(): void {
  console.log('Push notification initialised');

  if (!getVapidPublicKey()) {
    logger.error('push', 'VAPID_PUBLIC_KEY environment variable not set');
  }
  if (!getVapidPrivateKey()) {
    logger.error('push', 'VAPID_PRIVATE_KEY environment variable not set');
  }
  if (!getVapidPublicKey() || !getVapidPrivateKey()) {
    return;
  }

  webPush.setVapidDetails(
    'mailto:ivan@q-int.com',
    getVapidPublicKey(),
    getVapidPrivateKey(),
  );
}

export type VapidParams = {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
};

export type Options = {
  headers: Record<string, string>;
};

export class ExpiredOrInvalidSubscriptionError extends Error {
  constructor(description: string) {
    super(description);
  }
}

async function send(
  params: VapidParams,
  data: Record<string, any>,
  options: Options = null,
): Promise<void> {
  if (process.env.BUILD_ENV !== 'production') {
    logger.log('push', 'Sent push notification', [data]);
  }
  try {
    await webPush.sendNotification(params, JSON.stringify(data), options);
  } catch (err) {
    if (err.statusCode === 404 || err.statusCode === 410) {
      throw new ExpiredOrInvalidSubscriptionError(
        'Expired or invalid subscription',
      );
    } else {
      throw err;
    }
  }
}

export default {
  getVapidPublicKey,
  getVapidPrivateKey,
  init,
  send,
};
