import { Module, Next } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/user.service';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
