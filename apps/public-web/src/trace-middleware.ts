import { NextFunction, Response } from 'express';
import { Request } from '@sektek/common';
import { trace } from '@opentelemetry/api';

const name = 'public-web';
const version = '0.1.0';
const tracer = trace.getTracer(name, version);

export const traceMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  tracer.startActiveSpan(req.path, span => {
    try {
      next();
    } finally {
      span.end();
    }
  });
};
