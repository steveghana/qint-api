/* === Modules === */
import { BusinessModule } from '../business/src/business.module';
import { AuthModule } from '../auth/src/auth.module';
import { CustomerModule } from '../customer/src/customer.module';
import { QueueModule } from '../queue/src/queue.module';
import { ShortModule } from '../Shorturl/src/short.module';
import { PushModule } from '../Pushnotification/src/push.module';
import { SmsModule } from '../sms/src/sms.module';
import { ContactModule } from '../Contact/src/contact.module';
/* ==== All Entities are located in Config/model.js */
export const Modules = [
  BusinessModule,
  AuthModule,
  CustomerModule,
  ShortModule,
  QueueModule,
  PushModule,
  SmsModule,
  ContactModule,
];
