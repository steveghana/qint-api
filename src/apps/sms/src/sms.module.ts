import { CacheModule, Module, Next } from '@nestjs/common';
import { SmsController } from './controllers/sms.controller';

@Module({
  imports: [],
  controllers: [SmsController],
  // providers: [ShortUrlService],
})
export class SmsModule {}
