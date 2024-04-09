import winston, { Logger, format } from 'winston';
import LokiTransport from 'winston-loki';
import Transport from 'winston-transport';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';

  return isDevelopment ? 'debug' : 'info';
};

const consoleFormat = format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    info => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

const transports: Transport[] = [
  new winston.transports.Console({ format: consoleFormat }),
];

const lokiUrl = process.env.LOKI_URL;
const serviceName = process.env.SERVICE_NAME;
if (lokiUrl) {
  const lokiTransport = new LokiTransport({
    host: lokiUrl,
    format: format.json(),
    labels: { service_name: serviceName },
  });
  transports.push(lokiTransport);
}

const logger: Logger = winston.createLogger({
  level: level(),
  levels,
  transports,
});

export { logger };
