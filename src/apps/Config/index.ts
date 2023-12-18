import { RedisCacheService } from '../redis/redis.service';
import Entities, {
  createRepositories,
  EntitiesRepositoryMap,
  Repositories,
} from './model';
import myDataSource from '../../../db/data-source';
import { RedisCacheModule } from '../redis/redis.module';
export { default as myDataSource } from '../../../db/data-source';

// const repositories = createRepositories(Entities, myDataSource);
/* This is where all the application's data management dependencies are initialised */
const redisCacheService = RedisCacheModule.prototype.getRedisCacheService();

export type Context = {
  typeorm: typeof myDataSource;
  cache: RedisCacheService;
  models: typeof EntitiesRepositoryMap;
};

const globalContext: Context = {
  typeorm: myDataSource,
  cache: redisCacheService,
  models: EntitiesRepositoryMap,
};

export default globalContext;
