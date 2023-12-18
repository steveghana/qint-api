export class Deferred<T = any> {
    promise: Promise<T> = null;
    resolve: (value?: T) => void;
    reject: (reason?: any) => void;

    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }

    wrap(cb: () => any): void {
        try {
            const val = cb();
            this.resolve(val);
        } catch (e) {
            this.reject(e);
        }
    }

    static wrapped<wT = any>(cb: () => any): Deferred<wT> {
        const deferred = new Deferred<wT>();
        deferred.wrap(cb);
        return deferred;
    }
}

interface ILock {
    lock(): Promise<any>;
    release(): void;
}

export class Mutex implements ILock {
    locked = false;
    deferreds: Array<Deferred> = [];

    lock(): Promise<any> {
        if (!this.locked) {
            this.locked = true;
            return Promise.resolve();
        }
        const deferred = new Deferred();
        this.deferreds.push(deferred);
        return deferred.promise;
    }

    release(): void {
        const deferred = this.deferreds.shift();
        if (!deferred) {
            this.locked = false;
            return;
        }
        deferred.resolve();
    }
}

export async function synchronized(cb: () => any, lock: ILock): Promise<any> {
    if (!lock) {
        throw new Error('Lock is mandatory');
    }

    const deferred = new Deferred();
    try {
        await lock.lock();
        const result = await cb();
        deferred.resolve(result);
    } catch (err) {
        deferred.reject(err);
    } finally {
        lock.release();
    }
    return deferred.promise;
}

export default {
    Deferred,
    Mutex,
    synchronized,
};
