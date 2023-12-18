import config from '../../../apps/Config/config';
import inforumobile from './inforumobile';
import logger from '../log';

export type ReceiveMessageListener = (
  body: string,
  from: string,
  messageId: string,
) => void | Promise<void>;

export type Context = {
  client?: any;
  inforumobile: typeof inforumobile;
  phoneNumber: string;
  receiveMessageListeners: ReceiveMessageListener[];
};

const globalContext: Context = {
  client: null,
  phoneNumber: null,

  receiveMessageListeners: [],
  inforumobile:
    process.env.NODE_ENV === 'production'
      ? inforumobile
      : {
          sendSms: (
            _iu: string,
            _ia: string,
            sender: string,
            recipient: string,
            messageContent: string,
          ) => {
            logger.log('sms', 'If it were production, would have sent SMS', [
              { sender, recipient, messageContent },
            ]);
            return Promise.resolve();
          },
        },
};

function init(context = globalContext): Context {
  console.log('sms initialised');

  if (!context) {
    context = {
      phoneNumber: null,
      receiveMessageListeners: [],
      inforumobile: inforumobile,
    };
  }

  context.phoneNumber = config.smsPhoneNumber;
  return context;
}

async function sendMessage(
  body: string,
  to: string,
  context = globalContext,
): Promise<void> {
  await context.inforumobile.sendSms(
    process.env.INFORU_USER,
    process.env.INFORU_API_TOKEN,
    context.phoneNumber,
    to,
    body,
  );
}

async function receiveMessage(
  body: string,
  from: string,
  messageId: string,
  context = globalContext,
): Promise<void> {
  await Promise.all(
    context.receiveMessageListeners.map(async (listener) => {
      await listener(body, from, messageId);
    }),
  );
}

function addReceiveMessageListener(
  listener: ReceiveMessageListener,
  context = globalContext,
): void {
  context.receiveMessageListeners.push(listener);
}

function removeReceiveMessageListener(
  listener: ReceiveMessageListener,
  context = globalContext,
): void {
  const index = context.receiveMessageListeners.findIndex(
    (l) => l === listener,
  );
  if (index === -1) {
    return;
  }
  context.receiveMessageListeners.splice(index, 1);
}

export type Sms = {
  init: (context?: Context) => Context;
  sendMessage: (body: string, to: string, context?: Context) => Promise<void>;
  receiveMessage: (
    body: string,
    from: string,
    messageId: string,
    context?: Context,
  ) => Promise<void>;
  addReceiveMessageListener: (
    listener: ReceiveMessageListener,
    context?: Context,
  ) => void;
  removeReceiveMessageListener: (
    listener: ReceiveMessageListener,
    context?: Context,
  ) => void;
};

export default {
  init,
  sendMessage,
  receiveMessage,
  addReceiveMessageListener,
  removeReceiveMessageListener,
} as Sms;
