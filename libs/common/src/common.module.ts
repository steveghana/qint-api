import { Module } from '@nestjs/common';
import { CommonService } from './common.service';

@Module({
  imports: [],
  controllers: [],
  providers: [CommonService],
})
export class AuthModule {}
