import { strict as assert } from 'assert';
import sinon from 'sinon';
import defer, { Context } from '.';

describe('defer', () => {
    afterEach(() => {
        sinon.restore();
    });

    describe('registerProcedure', () => {
        it('Throws if procedure already registered', async () => {
            const key = 'key';
            const context = { procedures: { [key]: () => {} } };
            await assert.rejects(() => defer.registerProcedure(key, () => {}, context));
        });

        it('Assigns callback to procedure key', async () => {
            const key = 'key';
            const procedure = () => {};
            const context: Context = { procedures: {} };

            await defer.registerProcedure(key, procedure, context);

            assert.strictEqual(context.procedures[key], procedure);
        });
    });

    describe('deferProcedure', () => {
        it("Doesn't throw if procedure unregistered", async () => {
            const timer = sinon.useFakeTimers();
            await defer.deferProcedure('key', 1, { procedures: {} });
            assert.doesNotThrow(() => timer.runAll());
        });
    });

    describe('', () => {
        it("Doesn't call procedure immediately", async () => {
            const key = 'key';
            const stub = sinon.stub();
            const context = { procedures: {} };
            sinon.useFakeTimers();

            await defer.registerProcedure(key, stub, context);
            await defer.deferProcedure(key, 1, context);

            assert.strictEqual(stub.called, false);
        });

        it('Calls procedure after some time', async () => {
            const key = 'key';
            const stub = sinon.stub();
            const context = { procedures: {} };
            const timer = sinon.useFakeTimers();

            await defer.registerProcedure(key, stub, context);
            await defer.deferProcedure(key, 1, context);

            assert.strictEqual(stub.called, false);
            timer.runAll();
            assert.strictEqual(stub.called, true);
        });

        it('Calls procedure with the same parameters', async () => {
            const key = 'key';
            const stub = sinon.stub();
            const context = { procedures: {} };
            const timer = sinon.useFakeTimers();
            const params = ['hello', 'world', {}, 42];

            await defer.registerProcedure(key, stub, context);
            await defer.deferProcedure(key, 1, context, ...params);

            assert.strictEqual(stub.called, false);
            timer.runAll();
            assert.strictEqual(stub.called, true);
            assert.deepStrictEqual(stub.args[0], params);
        });

        it('Calls procedures ordered by time', async () => {
            const stub1 = sinon.stub();
            const stub2 = sinon.stub();
            const context = { procedures: {} };
            const timer = sinon.useFakeTimers();

            await defer.registerProcedure('key1', stub1, context);
            await defer.registerProcedure('key2', stub2, context);
            await defer.deferProcedure('key1', 1, context);
            await defer.deferProcedure('key2', 2, context);

            assert.strictEqual(stub1.called, false);
            assert.strictEqual(stub2.called, false);
            timer.next();
            assert.strictEqual(stub1.called, true);
            assert.strictEqual(stub2.called, false);
            timer.next();
            assert.strictEqual(stub2.called, true);
        });
    });
});
