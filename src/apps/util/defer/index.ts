/* We may want to perform a task a long time after some event occurs.
 * This can be a challenge if processes can spin up and tear down during that time,
 * like if we scale dynamically based on demand.
 * If we have multiple processes running simultaneously behind a load balancer,
 * potentially on different machines without common FS or IPC,
 * the scalable solution is to use a message broker for communication.
 *
 * We don't need this scale just yet, but want to keep the option to scale,
 * so instead of paying the cost now, we utilize setTimeout (process global state),
 * but abstracted away by an interface, so that it will be cheap to replace with a message broker.
 *
 * Guiding POC: https://github.com/Queueint/drpc-poc
 *
 * https://app.shortcut.com/queueint/story/2919/create-mechanism-for-deferring-tasks
 */

export type DeferrableProcedureKey = string;
export type DeferrableProcedure = (...params: Array<any>) => void;

export type Context = {
    procedures: Record<DeferrableProcedureKey, DeferrableProcedure>;
};

const globalContext: Context = {
    procedures: {},
};

async function registerProcedure(
    key: DeferrableProcedureKey,
    callback: DeferrableProcedure,
    context: Context = globalContext
): Promise<void> {
    if (context.procedures[key]) {
        throw new Error(`Procedure with key "${key}" already registered`);
    }
    context.procedures[key] = callback;
    return Promise.resolve();
}

async function deferProcedure(
    key: DeferrableProcedureKey,
    timeMs: number,
    context: Context = globalContext,
    ...params: Array<any>
): Promise<void> {
    if (!context) {
        context = globalContext;
    }
    setTimeout(() => {
        if (!context.procedures[key]) {
            return;
        }
        context.procedures[key](...params);
    }, timeMs);
    return Promise.resolve();
}

export default {
    registerProcedure,
    deferProcedure,
};
