// import { QueueAreaTrait as queueAreaTrait } from '@/apps/business/src/models/AreaTraits/queueAreaTrait.entity';
import { QueueAreaTrait as queueAreaTrait } from '../business/src/models/AreaTraits/queueAreaTrait.entity';
import { QueueGroupTable as queueGroupTable } from '../business/src/models/businessTables/queueGroupTable.entity';
import { QueueAreaQueueTable as queueAreaQueueTable } from '../business/src/models/AreaQueTables/queueAreaQueueTable.entity';
import { QueueArea as queueArea } from '../business/src/models/Area/queueArea.entity';
import { QueueCustomerTraits as queueCustomerTrait } from '../customer/src/models/Traits/queueCustomerTrait.entity';
import { QueueCustomerQueueArea as queueCustomerQueueArea } from '../customer/src/models/Areas/queueCustomerQueueArea.entity';
import { QueueCustomerEntity as queueCustomer } from '../customer/src/models/QueueCustomer/queueCustomer.entity';
import { CustomerEntity as customer } from '../customer/src/models/customer.entity';
import { AuthtokenEntity as authToken } from '../auth/src/models/Token/authToken.entity';
import { CredentialTokenEntity as credentialToken } from '../auth/src/models/CredentialToken/credentialToken.entity';
import { UserEntity as user } from '../auth/src/models/user.entity';
import { BusinessEntity as queueGroup } from '../business/src/models/business.entity';
import { BusinessPermissionEntity as queueGroupUserPermission } from '../business/src/models/Permissions/permission.entity';
import { QueueEntity as queue } from '../queue/src/model/queue.entity';
import { ReservationEntity as reservation } from '../business/src/models/reservation/index.entity';
import { ReservationQueueAreaEntity as reservationQueueArea } from '../business/src/models/reservation/reservationQueueArea.entity';
import { FeedbackEntity as feedback } from '../business/src/models/feedback/index.entity';
import { ReservationTraitEntity as reservationTrait } from '../business/src/models/reservation/reservationTrait.entity';
import { AdvertisementEntity as advertisement } from '../business/src/models/advertisement/index.entity';
import { Cart as cart } from '../customer/src/models/CartItems/CartItem.entity';
import { CartItem as cartitem } from '../customer/src/models/CartItems/ProductQty.entity';
import { ShortUrlEntity as shortUrl } from '../Shorturl/src/model/shortUrl.entity';
import { DataSource, Repository } from 'typeorm';

type RepositoryType<T> = Repository<T>;
export type Repositories = {
  authToken: RepositoryType<authToken>;
  user: RepositoryType<user>;
  credentialToken: RepositoryType<credentialToken>;
  customer: RepositoryType<customer>;
  queue: RepositoryType<queue>;
  queueArea: RepositoryType<queueArea>;
  queueAreaQueueTable: RepositoryType<queueAreaQueueTable>;
  queueGroupTable: RepositoryType<queueGroupTable>;
  queueAreaTrait: RepositoryType<queueAreaTrait>;
  queueCustomer: RepositoryType<queueCustomer>;
  queueCustomerQueueArea: RepositoryType<queueCustomerQueueArea>;
  queueCustomerTrait: RepositoryType<queueCustomerTrait>;
  queueGroup: RepositoryType<queueGroup>;
  queueGroupUserPermission: RepositoryType<queueGroupUserPermission>;
  shortUrl: RepositoryType<shortUrl>;
  cart: RepositoryType<cart>;
  cartitem: RepositoryType<cartitem>;
  // add other entities here with their respective RepositoryTypes
};

export function createRepositories(
  entities: any[],
  myDataSource: DataSource,
): Repositories {
  return entities.reduce((acc, entity) => {
    const name = entity.name.toLowerCase();
    acc[name] = myDataSource.getRepository(entity);
    return acc;
  }, {} as Repositories);
}
// export const createRepositories = async (connection: Connection) => {
//   const repositories = {};
//   for (const entity of Entities) {
//     const repository = connection.getRepository(entity);
//     repositories[entity.name] = repository;
//   }
//   return repositories;
// };

// export type Repositories = ReturnType<typeof createRepositories>;
export const EntitiesRepositoryMap = {
  advertisement,
  authToken,
  credentialToken,
  customer,
  feedback,
  queue,
  cart,
  cartitem,
  queueArea,
  queueAreaQueueTable,
  queueGroupTable,
  queueAreaTrait,
  queueCustomer,
  queueCustomerQueueArea,
  queueCustomerTrait,
  queueGroup,
  queueGroupUserPermission,
  reservation,
  reservationQueueArea,
  reservationTrait,
  shortUrl,
  user,
};

const Entities = [
  advertisement,
  authToken,
  credentialToken,
  customer,
  feedback,
  queue,
  cart,
  cartitem,
  queueArea,
  queueAreaQueueTable,
  queueGroupTable,
  queueAreaTrait,
  queueCustomer,
  queueCustomerQueueArea,
  queueCustomerTrait,
  queueGroup,
  queueGroupUserPermission,
  reservation,
  reservationQueueArea,
  reservationTrait,
  shortUrl,
  user,
];

// export { repositories };
export default Entities;
