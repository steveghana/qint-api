import { CacheModule, Module, Next } from '@nestjs/common';
import { PushController } from './controllers/push.controller';

@Module({
  imports: [],
  controllers: [PushController],
  // providers: [ShortUrlService],
})
export class PushModule {}
