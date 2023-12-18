// import { RedisService } from 'nestjs-redis';
import { CACHE_MANAGER, Inject, Injectable, Next } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  public async get(key: string) {
    return await this.cacheManager.get(key);
  }
  public async set(key: string, value: object) {
    await this.cacheManager.set(key, value);
  }
  public async del(key: any) {
    await this.cacheManager.del(key);
  }
}

/* 

@Injectable()
export class CacheService {
  private readonly client: Redis;

  constructor(private readonly redisService: RedisService) {
    this.client = redisService.getClient();
  }

async set(key: string, value: any, options?: SetOptions): Promise<string | null> {
  const { ttl } = options || {};
  await this.client.set(key, JSON.stringify(value));
  if (ttl) {
    await this.client.expire(key, ttl);
  }
  return key;
}


  async get(key: string): Promise<any | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }
} */
