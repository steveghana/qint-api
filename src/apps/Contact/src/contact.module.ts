import { CacheModule, Module, Next } from '@nestjs/common';
import { ContactController } from './controllers/contact.controller';

@Module({
  imports: [],
  controllers: [ContactController],
  // providers: [ShortUrlService],
})
export class ContactModule {}
