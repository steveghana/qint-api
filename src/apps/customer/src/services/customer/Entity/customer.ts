import { ICustomer } from '../../../../../types/customer';
import {
  createCustomer,
  getCustomerById,
  getCustomerByPhone,
  updateCustomer,
  findOrCreateCustomerByPhone,
} from '../DBGateway/customer';
import {
  Dependencies,
  injectDependencies,
} from '../../../../../util/dependencyInjector';
import { EntityManager } from 'typeorm';
import { Cache } from "cache-manager";

class Customer {
  private data: ICustomer = null;

  private constructor(data: ICustomer) {
    this.data = data;
  }

  static async getById(
  cacheManager: Cache,

    id: string,
    transaction: EntityManager = null,
    dependencies: Dependencies = null,
  ): Promise<Customer> {
    dependencies = injectDependencies(dependencies, ['db']);
    const data = await getCustomerById(cacheManager, id, transaction, dependencies);
    if (!data) {
      return null;
    }
    return new Customer(data);
  }

  static async getByPhone(
  cacheManager: Cache,

    phone: string,
    transaction: EntityManager = null,
    dependencies: Dependencies = null,
  ): Promise<Customer> {
    dependencies = injectDependencies(dependencies, ['db']);
    const data = await getCustomerByPhone(cacheManager,phone, transaction, dependencies);
    if (!data) {
      return null;
    }
    return new Customer(data);
  }

  static async create(
  cacheManager: Cache,

    data: Partial<ICustomer>,
    transaction: EntityManager = null,
    dependencies: Dependencies = null,
  ): Promise<Customer> {
    dependencies = injectDependencies(dependencies, ['db']);
    const created = await createCustomer(cacheManager,data, transaction, dependencies);
    if (!created) {
      return null;
    }
    return new Customer(created);
  }

  static async update(
  cacheManager: Cache,

    id: string,
    data: Partial<ICustomer>,
    transaction: EntityManager = null,
    dependencies: Dependencies = null,
  ): Promise<void> {
    dependencies = injectDependencies(dependencies, ['db']);
    await updateCustomer(cacheManager,id, data, transaction, dependencies);
  }

  static async findOrCreateByPhone(
  cacheManager: Cache,

    phone: string,
    createQuery: Partial<ICustomer>,
    transaction: EntityManager = null,
    dependencies: Dependencies = null,
  ): Promise<[Customer, boolean]> {
    dependencies = injectDependencies(dependencies, ['db']);
    const [data, created] = await findOrCreateCustomerByPhone(
      cacheManager,
      phone,
      createQuery,
      transaction,
      dependencies,
    );
    return [new Customer(data), created];
  }

  get id(): string {
    return this.data && this.data.id;
  }

  get name(): string {
    return this.data && this.data.name;
  }

  get phone(): string {
    return this.data && this.data.phone;
  }

  get agent(): string {
    return this.data && this.data.agent;
  }

  get ipAddress(): string {
    return this.data && this.data.ipAddress;
  }

  get vapidEndpoint(): string {
    return this.data && this.data.vapidEndpoint;
  }

  get vapidEndpointIv(): string {
    return this.data && this.data.vapidEndpointIv;
  }

  get vapidP256dh(): string {
    return this.data && this.data.vapidP256dh;
  }

  get vapidP256dhIv(): string {
    return this.data && this.data.vapidP256dhIv;
  }

  get vapidAuth(): string {
    return this.data && this.data.vapidAuth;
  }

  get vapidAuthIv(): string {
    return this.data && this.data.vapidAuthIv;
  }
}

export default Customer;
