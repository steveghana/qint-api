import { Module, Next } from '@nestjs/common';
import { QueueController } from './controllers/queue.controller';
import { QueueService } from './services/service/queue.service';

@Module({
  imports: [],
  controllers: [QueueController],
  providers: [QueueService],
})
export class QueueModule {}
