import morgan, { TokenIndexer } from 'morgan';
import { Request } from './request';
import { Response } from 'express';
import { logger } from './logger';

const stream = {
  write: (message: string) => logger.http(message),
};

const format = (
  tokens: TokenIndexer<Request, Response>,
  req: Request,
  res: Response,
) => {
  const id = req.id || '-';
  const status = res.statusCode || '-';
  const responseTime = tokens['response-time'](req, res) || '-';

  return [
    id,
    tokens['remote-addr'](req, res),
    tokens.method(req, res),
    tokens.url(req, res),
    status,
    tokens.res(req, res, 'content-length'),
    `${responseTime} ms`,
  ].join(' ');
};

export const morganMiddleware = morgan(format, { stream });