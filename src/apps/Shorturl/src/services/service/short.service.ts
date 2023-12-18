// import { ResultBoundary } from '../..';
import {
  Dependencies,
  injectDependencies,
} from '../../../../util/dependencyInjector';
import shortUrl from '../Entity/shortUrl';
import { Cache } from 'cache-manager';

import { Injectable } from '@nestjs/common/decorators';
import {
  HttpException,
  HttpStatus,
  Inject,
  CACHE_MANAGER,
  Next,
} from '@nestjs/common';

@Injectable()
export class ShortUrlService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  // private readonly userRepository: Repository<UserEntity>, // @InjectRepository(UserEntity)
  async resolveShortUrl(
    shortComponent: string,
    dependencies: Dependencies = null,
  ) /* : Promise<ResolveShortUrlSuccess | ResolveShortUrlFailure>  */ {
    dependencies = injectDependencies(dependencies, ['db']);

    const longComponent = await shortUrl.resolve(
      this.cacheManager,
      shortComponent,
      dependencies,
    );
    console.log(longComponent, 'shorurl');
    if (!longComponent) {
      throw new HttpException('not found', HttpStatus.BAD_REQUEST);
    }

    return longComponent;
  }
}
