import { NextFunction, Response } from 'express';
import { Request, logger } from '@sektek/common';
import { trace } from '@opentelemetry/api';

const name = 'ping-listener';
const version = '0.1.0';
const tracer = trace.getTracer(name, version);

export const traceMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const currentSpan = trace.getActiveSpan();
  // display traceid in the terminal
  const traceId = currentSpan?.spanContext()?.traceId;
  logger.info({ traceId });
  tracer.startActiveSpan(req.path, span => {
    try {
      next();
    } finally {
      span.end();
    }
  });
};
