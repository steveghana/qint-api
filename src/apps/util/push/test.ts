import Push, { VapidParams } from '.';

type SentPush = {
    params: VapidParams;
    data: Record<string, any>;
};

interface TestContext {
    sentPushes: SentPush[];
}

export function init(): TestContext {
    return {
        sentPushes: [],
    };
}

export function makeDependency(context: TestContext = null): typeof Push {
    if (!context) {
        context = init();
    }
    return {
        init,
        getVapidPublicKey: Push.getVapidPrivateKey,
        getVapidPrivateKey: Push.getVapidPrivateKey,
        send: (params: VapidParams, data: Record<string, any>) => {
            context.sentPushes.push({ params, data });
            return Promise.resolve();
        },
    };
}
