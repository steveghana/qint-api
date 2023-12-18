import { Dependencies, injectDependencies } from './dependencyInjector';
import { EntityManager } from 'typeorm';
import { myDataSource } from '../Config';
type Transaction = EntityManager;
const manager = myDataSource.manager;
export async function useTransaction<T>(
  callback: (transaction: EntityManager) => Promise<T>,
  dependencies: Dependencies = null,
): Promise<T> {
  dependencies = injectDependencies(dependencies, ['db']);

  try {
    return await manager.transaction(async (transaction) => {
      return await callback(transaction);
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export function ensureTransaction<T>(
  transaction: Transaction,
  callback: (transaction: Transaction) => Promise<T>,
  dependencies: Dependencies = null,
): Promise<T> {
  dependencies = injectDependencies(dependencies, ['db']);
  if (transaction) {
    return callback(transaction);
  }
  return useTransaction(callback, dependencies);
}

export function generateAlphanumeric(length: number): string {
  const options =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from(' '.repeat(length))
    .map(() => options[Math.floor(Math.random() * options.length)])
    .join('');
}

export default { useTransaction, ensureTransaction, generateAlphanumeric };
