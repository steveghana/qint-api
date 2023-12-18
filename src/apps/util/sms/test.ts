import sms, { Context, ReceiveMessageListener, Sms } from '.';

type SentMessage = {
    body: string;
    to: string;
};

interface TestContext extends Context {
    sentMessages: SentMessage[];
}

export function init(): TestContext {
    const context = {
        phoneNumber: '+15005550006',
        receiveMessageListeners: [],
        sentMessages: [],
        inforumobile: {
            sendSms: (
                _inforuUsername: string,
                _inforuApiToken: string,
                _sender: string,
                recipient: string,
                messageContent: string
            ) => {
                context.sentMessages.push({
                    body: messageContent,
                    to: recipient,
                });
            },
        },
    } as TestContext;
    return context;
}

export function getSentMessages(context: TestContext): SentMessage[] {
    return context.sentMessages;
}

export function makeDependency(context: TestContext = null): Sms {
    if (!context) {
        context = init();
    }
    return {
        init: () => null,
        sendMessage: (body: string, to: string): Promise<void> => sms.sendMessage(body, to, context),
        receiveMessage: (body: string, from: string, messageId: string) =>
            sms.receiveMessage(body, from, messageId, context),
        addReceiveMessageListener: (listener: ReceiveMessageListener) =>
            sms.addReceiveMessageListener(listener, context),
        removeReceiveMessageListener: (listener: ReceiveMessageListener) =>
            sms.removeReceiveMessageListener(listener, context),
    };
}

export default {
    init,
    makeDependency,
    getSentMessages,
};
