import { Logger, QueryRunner } from 'typeorm';
import * as chalk from 'chalk';
import { createLogger, transports, format } from 'winston';

const { combine, timestamp, printf } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}] ${message}`;
});

const winstonLogger = createLogger({
  level: 'debug',
  transports: [new transports.Console()],
  format: combine(timestamp(), logFormat),
});

export class TypeOrmLogger implements Logger {
  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    const sql = chalk.blue(query);
    const params = chalk.yellow(JSON.stringify(parameters));
    winstonLogger.info(`[QUERY] ${sql} -- PARAMETERS: ${params}`);
  }

  logQueryError(
    error: string,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ) {
    const sql = chalk.red(query);
    const params = chalk.bgRed(JSON.stringify(parameters));
    winstonLogger.error(
      `[QUERY ERROR] ${error} -- QUERY: ${sql} -- PARAMETERS: ${params}`,
    );
  }

  logQuerySlow(
    time: number,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ) {
    const sql = chalk.green(query);
    winstonLogger.warn(`[QUERY SLOW] ${time}ms -- QUERY: ${sql}`);
  }

  logSchemaBuild(message: string, queryRunner?: QueryRunner) {
    winstonLogger.info(`[SCHEMA BUILD] ${message}`);
  }

  logMigration(message: string, queryRunner?: QueryRunner) {
    winstonLogger.info(`[MIGRATION] ${message}`);
  }

  log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner) {
    winstonLogger.log(level, message);
  }
}
