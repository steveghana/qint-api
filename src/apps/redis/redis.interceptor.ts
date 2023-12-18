import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpServer,
  Next,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisCacheService } from './redis.service';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private readonly cacheService: RedisCacheService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const cacheKey = this.getCacheKey(context);

    const cachedValue = await this.cacheService.get(cacheKey);

    if (cachedValue) {
      return cachedValue as any;
    }

    return next.handle().pipe(
      tap((response) => {
        // Cache the response for future requests
        this.cacheService.set(cacheKey, response);
      }),
    );
  }

  private getCacheKey(context: ExecutionContext): string {
    const httpAdapter = context.getType<any>();
    const request = context.switchToHttp().getRequest();
    const url = httpAdapter.getRequestUrl(request);
    const method = httpAdapter.getRequestMethod(request);

    const tags = ['users', 'admins']; // Get the tags for this endpoint

    const tagKeys = tags.map((tag) => `tag=${tag}`).join('&');
    return `${method}-${url}?${tagKeys}`;
  }
}

/* call in all get request like this @UseInterceptors(CacheInterceptor) */
