import expressWinston from 'express-winston';
import { logger } from './logger.js';

export const logMiddleware = expressWinston.logger({
  winstonInstance: logger,
  requestWhitelist: [...expressWinston.requestWhitelist, 'id'],
});

export const errorLogMiddleware = expressWinston.errorLogger({
  winstonInstance: logger,
  requestWhitelist: [...expressWinston.requestWhitelist, 'id'],
});
