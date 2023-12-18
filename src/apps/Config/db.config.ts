import { registerAs } from '@nestjs/config';
import Entities from './model';
import { ConfigService } from '@nestjs/config';
import config from './config';
import { TypeOrmLogger } from '../util/lg';
// import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { dbConnexion } from './../../../db/data-source';
// let configService: ConfigService;
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
// export default registerAs('database', () => ({
//   ...dbConnexion,
//   loggin: true,
//   autoLoadEntities: true,
//   extra: {
//     charset: 'utf8mb4_unicode_ci',
//   },
//   dateStrings: true,
//   ssl: process.env.NODE_ENV === 'production', // enable SSL/TLS
//   logger: new TypeOrmLogger(),
//   entities: Object.values(Entities),
//   migrations: ['../../../dist/migrations/**/*.js'],
//   cli: {
//     migrationsDir: 'migrations/*.ts',
//   },
// }));

export default registerAs('database', () => ({
  type: 'postgres',
  logging: true,

  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'postgres',

  autoLoadEntities: true,
  extra: {
    charset: 'utf8mb4_unicode_ci',
  },
  // ssl: {
  //   rejectUnauthorized: false,
  // }, // enable SSL/TLS
  dateStrings: true,
  logger: new TypeOrmLogger(),

  entities: Object.values(Entities),
  migrations: ['./dist/migrations/**/*.js'],
  cli: {
    migrationsDir: 'src/apps/migrations/*.ts',
  },
}));
