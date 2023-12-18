import { DataSource, DataSourceOptions } from 'typeorm';
// import config from '../src/apps/Config/config';
// import { ConfigService } from '@nestjs/config';
import Entities from '../src/apps/Config/model';
import { TypeOrmLogger } from '../src/apps/util/lg';
import * as dotenv from 'dotenv';

dotenv.config(); // load environment variables from .env file
// const configService: ConfigService;

export const dbConnexion = {
  type: 'postgres',

  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'postgres',
  logger: new TypeOrmLogger(),
  entities: [...Entities],
  // ssl: {
  //   rejectUnauthorized: false,
  // }, // enable SSL/TLS
  synchronize: true,
};

const myDataSource = new DataSource({
  ...dbConnexion,
  migrations: ['./dist/migrations/**/*.js'],
} as DataSourceOptions);
export default myDataSource;
