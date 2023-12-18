import { strict as assert } from 'assert';
import { injectDependencies } from './dependencyInjector';

describe('dependencyInjector', () => {
    describe('injectDependencies()', () => {
        it("Injects what it's asked to", () => {
            const dependency = {};
            const inputDependencies = {};
            const outputDependencies = injectDependencies(inputDependencies, ['db'], {
                db: dependency as any,
            });
            assert.strictEqual(outputDependencies.db, dependency);
        });

        it("Doesn't inject if not asked to", () => {
            const dependency = {};
            const inputDependencies = {};
            const outputDependencies = injectDependencies(inputDependencies, [], {
                db: dependency as any,
            });
            assert.strictEqual(outputDependencies.db, undefined);
        });

        it("Doesn't inject if already injected", () => {
            const oldDependency = {};
            const newDependency = {};
            const inputDependencies = {
                db: oldDependency as any,
            };
            const outputDependencies = injectDependencies(inputDependencies, ['db'], {
                db: newDependency as any,
            });
            assert.strictEqual(outputDependencies.db, oldDependency);
        });
    });
});
