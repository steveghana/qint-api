import { format, Logger, transports, createLogger } from 'winston';
import 'winston-daily-rotate-file';
import chalk from 'chalk';
// import config from '@/apps/AllModelDeps/config';
import config from '../Config/config';

type Context = {
  loggers: Logger[];
};

const globalContext: Context = {
  loggers: [],
};

type LogLevel = 'error' | 'warn' | 'info';
type Subsystem = string;

function init(context = globalContext): void {
  const formatMeta = format((info) => {
    return {
      ...info,
      meta: info.meta
        .map((m: any) => {
          if (!m) {
            return '';
          }
          if (typeof m === 'string' || m instanceof String) {
            return m as string;
          }
          if (m instanceof Error) {
            return m.stack;
          }
          if (typeof m === 'object' || m instanceof Object) {
            return JSON.stringify(m, null, 2);
          }
          return String(m);
        })
        .filter((m: string) => !!m),
    };
  });
  const enabled = process.env.NODE_ENV !== 'production';
  const transport =
    enabled &&
    new transports.DailyRotateFile({
      zippedArchive: true,
      filename: '%DATE%.log',
      dirname: 'log',
      maxFiles: '14d',
      utc: true,
    });
  context.loggers.push(
    createLogger({
      format: format.combine(
        format.timestamp(),
        // formatMeta(),
        format.json(),
      ),
      transports: enabled ? [transport] : [],
    }),
  );
  if (process.env.NODE_ENV !== 'production') {
    context.loggers.push(
      createLogger({
        transports: [
          new transports.Console({
            format: format.combine(
              format((info) => {
                if (info.subsystem === 'db' && !config.logSql) {
                  return false;
                }
                return info;
              })(),
              formatMeta(),
              format.printf((info) => {
                const labelColors: Record<LogLevel, chalk.Chalk> = {
                  info: chalk?.bgWhite.black,
                  warn: chalk?.bgYellow.black,
                  error: chalk?.bgRed.black,
                };
                const levelColors: Partial<Record<LogLevel, chalk.Chalk>> = {
                  error: chalk?.red,
                };
                const subsystemColors: Record<Subsystem, chalk.Chalk> = {
                  db: chalk?.blueBright,
                  api: chalk?.whiteBright,
                  ws: chalk?.whiteBright,
                  sms: chalk?.yellow,
                  email: chalk?.yellow,
                  push: chalk?.yellow,
                };
                const noColor = (s: string) => s;
                const labelColor =
                  labelColors[info.level as LogLevel] ?? noColor;
                const levelColor =
                  levelColors[info.level as LogLevel] ?? labelColor;
                const subsystemColor =
                  subsystemColors[info.subsystem as Subsystem] ?? noColor;
                const messageColor =
                  info.level === 'error' ? levelColor : subsystemColor;

                return (
                  (info.level ? `${labelColor(info.level)}` : '') +
                  (info.subsystem ? subsystemColor(` ${info.subsystem}`) : '') +
                  subsystemColor(': ') +
                  messageColor(info.message) +
                  (info.meta.length > 0 ? '\n' : '') +
                  messageColor(info.meta.join(', ') as string)
                );
              }),
            ),
          }),
        ],
      }),
    );
  }
}

function write(
  level: LogLevel,
  subsystem: Subsystem,
  message: string,
  meta: any[] = [],
  context = globalContext,
): void {
  context.loggers.forEach((logger) =>
    logger.log({
      level,
      message,
      subsystem,
      meta,
    }),
  );
}

function log(
  subsystem: Subsystem,
  message: string,
  meta: any[] = [],
  context = globalContext,
): void {
  write('info', subsystem, message, meta, context);
}

function warn(
  subsystem: Subsystem,
  message: string,
  meta: any[] = [],
  context = globalContext,
): void {
  write('warn', subsystem, message, meta, context);
}

function error(
  subsystem: Subsystem,
  message: string,
  meta: any[] = [],
  context = globalContext,
): void {
  write('error', subsystem, message, meta, context);
}

export default {
  init,
  log,
  warn,
  error,
};
