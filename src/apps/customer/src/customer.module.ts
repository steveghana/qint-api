import { Module, Next } from '@nestjs/common';
import { CustomerController } from './controllers/queuecustomer.controller';
import { QueueCustomerService } from './services/QueueCustomer/service/index.service';

@Module({
  imports: [],
  controllers: [CustomerController],
  providers: [QueueCustomerService],
})
export class CustomerModule {}
