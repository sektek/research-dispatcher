import { NextFunction, Response } from 'express';
import { Request } from './http/request.js';
import { v4 as uuidv4 } from 'uuid';

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.id = uuidv4();
  next();
};
