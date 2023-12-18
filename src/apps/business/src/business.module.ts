import { Module, Next } from '@nestjs/common';
import { AdvertsController } from './controllers/advertisement.controller';
import { AnalyticsController } from './controllers/analytics.controller';
// import { BusinessController } from './business.controller';
import { BusinessController } from './controllers/Business.controller';
import { FeedbackController } from './controllers/feedback.controller';
import { ReservationController } from './controllers/reservation.controller';
import { AdvertisementService } from './services/advertisement/service/advertisement.service';
import { AnalyticsService } from './services/analytics/service/analytics.service';
import { FeedbackService } from './services/feedback/service/feedback.service';
import { ReservationService } from './services/reservation/service/reservation.service';
import { BusinessService } from './services/Root/service/index.service';
import { UserPermissionController } from './controllers/user.controller';
import { UserPermissionsService } from './services/Permissions/service/user.service';

@Module({
  imports: [],
  controllers: [
    BusinessController,
    AdvertsController,
    FeedbackController,
    AnalyticsController,
    ReservationController,
    UserPermissionController,
  ],
  providers: [
    BusinessService,
    AdvertisementService,
    FeedbackService,
    AnalyticsService,
    ReservationService,
    UserPermissionsService,
  ],
})
export class BusinessModule {}
