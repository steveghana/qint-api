import {
  Dependencies,
  injectDependencies,
} from '../../../../util/dependencyInjector';
import {
  LessThanOrEqual,
  IsNull,
  Brackets,
  Not,
  MoreThanOrEqual,
} from 'typeorm';
import { ShortUrlEntity } from '../../model/shortUrl.entity';
import { Cache } from 'cache-manager';
import myDataSource from '../../../../../../db/data-source';

async function destroyExpired(
  cacheManager: Cache,
  dependencies: Dependencies = null,
): Promise<void> {
  dependencies = injectDependencies(dependencies, ['db']);
  let shortRepo = myDataSource.manager.getRepository(
    dependencies.db.models.shortUrl,
  );
  await shortRepo
    .createQueryBuilder()
    .delete()
    .from(ShortUrlEntity)
    .where('expirationDate <= :now', { now: new Date() })
    .andWhere(
      new Brackets((qb) => {
        qb.where({ expirationDate: Not(IsNull()) });
      }),
    )
    .execute();
}

async function resolveShortUrl(
  cacheManager: Cache,
  shortComponent: string,
  dependencies: Dependencies = null,
): Promise<{ longComponent: string }> {
  dependencies = injectDependencies(dependencies, ['db']);

  let shortRepo = myDataSource.manager.getRepository(
    dependencies.db.models.shortUrl,
  );
  // let item = await 
  // console.log(item, shortComponent, 'from short');

  const [shortUrl] = await Promise.all([
    shortRepo.findOne({
      where: {
        shortComponent,
        expirationDate: MoreThanOrEqual(new Date()),
      },
    }),
    destroyExpired(cacheManager, dependencies),
  ]);
  return shortUrl;
}

async function create(
  cacheManager: Cache,
  shortComponent: string,
  longComponent: string,
  expirationDate: Date = null,
  dependencies: Dependencies = null,
): Promise<{ shortComponent: string }> {
  dependencies = injectDependencies(dependencies, ['db']);
  let shortRepo = myDataSource.manager.getRepository(
    dependencies.db.models.shortUrl,
  );

  let data = shortRepo.create({
    shortComponent,
    longComponent,
    expirationDate,
  });
  await shortRepo.save(data);
  return { shortComponent };
}

export default {
  destroyExpired,
  resolveShortUrl,
  create,
};
