import {
  Module,
  DynamicModule,
  CacheModule,
  Next,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  MiddlewareConsumer,
  NestModule,
  Type,
} from '@nestjs/common/interfaces';
import { Provider } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Modules } from './exports';
import * as path from 'path';
// import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { myDataSource } from '../../apps/Config';
import config from '../Config/config';
import { SocketModule } from '../ws/ws.module';
import { RedisCacheModule } from '../redis/redis.module';
import { CorsMiddleware } from '../middleware/cors.middleware';
// import { UserEntity } from '../auth/src/models/user.entity';
import dbConfiguration from '../Config/db.config';
import {
  AcceptLanguageResolver,
  I18nJsonLoader,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { AppGateway } from '../ws/ws.gateway';
import { AuthMiddleware } from '../middleware/authenticated.middleware';
import { OptionalAuthMiddleware } from '../middleware/optionallyAuthenticated.middleware';
import { AuthenticationTtlMiddleware } from '../middleware/authenticationTtl.middleware';
@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'he',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        // process.env.NODE_ENV === 'production'
        // ? './dist/src/apps/util/locale'
        // :
        // './src/apps/util/locale',
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    // RedisCacheModule,
    CacheModule.register({
      ttl: 5,
      max: 100,
      isGlobal: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [dbConfiguration],
    }),
    // database configuration goes here
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        myDataSource
          .initialize()
          .then(async () => {
            console.log('Data Source has been initialized!');
          })
          .catch((err) => {
            console.error('Error during Data Source initialization', err);
          });
        return {
          ...configService.get('database'),
        };
      },
      inject: [ConfigService],
    }),
    ...Modules,
  ],
  controllers: [],
  providers: [
    // AppService,
    AppGateway,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuthenticationTtlMiddleware,
    },
  ],
})
// export class AppModule {}
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorsMiddleware)
      .forRoutes('*')
      //AuthTTL
      //OptionalAuth
      .apply(AuthMiddleware)
      .forRoutes(
        //advertisement
        {
          path: 'queueGroup/:queueGroupId/advertisement',
          method: RequestMethod.POST,
        },
        {
          path: 'queueGroup/:queueGroupId/advertisement/:advertisementId',
          method: RequestMethod.PATCH,
        },
        {
          path: 'queueGroup/:queueGroupId/advertisement/:advertisementId',
          method: RequestMethod.DELETE,
        },
        //analytic
        {
          path: 'queueGroup/:queueGroupId/analytic',
          method: RequestMethod.GET,
        },
        {
          path: 'queueGroup/:queueGroupId/analytic/shift',
          method: RequestMethod.GET,
        },
        //Business | QueueGroup
        { path: 'queueGroup/', method: RequestMethod.GET },
        { path: 'queueGroup/', method: RequestMethod.POST },
        { path: 'queueGroup/:queueGroupId', method: RequestMethod.GET },
        { path: 'queueGroup/:queueGroupId', method: RequestMethod.POST },
        { path: 'queueGroup/:queueGroupId', method: RequestMethod.PATCH },
        { path: 'queueGroup/:queueGroupId/area', method: RequestMethod.PATCH },
        { path: 'queueGroup/:queueGroupId/table', method: RequestMethod.PATCH },
        {
          path: 'queueGroup/:queueGroupId/reservation/all',
          method: RequestMethod.GET,
        },
        //user
        { path: '/queueGroup/:queueGroupId/user', method: RequestMethod.PUT },
        //queuecustomer
        {
          path: '/queueGroup/:queueGroupId/queue/:queueId/customer/removedQueueCustomers',
          method: RequestMethod.GET,
        },
        {
          path: '/queueGroup/:queueGroupId/queue/:queueId/customer/:queueCustomerId/call-now',
          method: RequestMethod.POST,
        },
        {
          path: '/queueGroup/:queueGroupId/queue/:queueId/customer/:cartId/cartItems',
          method: RequestMethod.PATCH,
        },
        {
          path: '/queueGroup/:queueGroupId/queue/:queueId/customer/:cartId/cartItems',
          method: RequestMethod.DELETE,
        },
        {
          path: '/queueGroup/:queueGroupId/queue/:queueId/customer/all/silent',
          method: RequestMethod.DELETE,
        },
        //queue
        { path: '/queueGroup/:queueGroupId/queue', method: RequestMethod.POST },
        {
          path: '/queueGroup/:queueGroupId/queue/:queueId',
          method: RequestMethod.DELETE,
        },
        {
          path: '/queueGroup/:queueGroupId/queue/:queueId/next',
          method: RequestMethod.POST,
        },
        {
          path: '/queueGroup/:queueGroupId/queue/:queueId/next',
          method: RequestMethod.DELETE,
        },
        {
          path: '/queueGroup/:queueGroupId/queue/:queueId/again',
          method: RequestMethod.POST,
        },
        {
          path: '/queueGroup/:queueGroupId/queue/:queueId/previous',
          method: RequestMethod.POST,
        },
        {
          path: '/queueGroup/:queueGroupId/queue/:queueId/table-checkout',
          method: RequestMethod.PUT,
        },
        {
          path: '/queueGroup/:queueGroupId/queue/:queueId',
          method: RequestMethod.PATCH,
        },
        {
          path: '/queueGroup/:queueGroupId/queue/:queueId/display-type',
          method: RequestMethod.PUT,
        },
        //Auth
        {
          path: '/user/logout',
          method: RequestMethod.POST,
        },
        {
          path: '/user/whoami',
          method: RequestMethod.GET,
        },
      )
      .apply(OptionalAuthMiddleware)
      .forRoutes(
        {
          path: '/queueGroup/:queueGroupId/queue/:queueId/customer/restore',
          method: RequestMethod.POST,
        },
        {
          path: '/queueGroup/:queueGroupId/queue/:queueId/customer/:queueCustomerId',
          method: RequestMethod.DELETE,
        },
        {
          path: '/queueGroup/:queueGroupId/queue/:queueId',
          method: RequestMethod.GET,
        },
      );
  }
}
