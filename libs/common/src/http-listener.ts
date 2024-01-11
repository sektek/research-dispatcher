import { EventHandler, EventHandlerFn } from './event-handler';
import { Event } from './event';
import { EventRequest } from './event-request';
import { Logger } from 'winston';
import { Response } from 'express';

type HttpListenerHandler<T extends Event> =
  | EventHandlerFn<T, void>
  | EventHandler<T, void>;

interface HttpListenerOptions<T extends Event> {
  logger: Logger;
  handler: HttpListenerHandler<T>;
  urlBuilder?: (event: T) => string;
}

export const httpListener = <T extends Event>(opts: HttpListenerOptions<T>) => {
  const { logger, handler } = opts;

  let handle: EventHandlerFn<T, void>;
  if (typeof handler === 'function') {
    handle = handler;
  } else {
    handle = handler.handle.bind(handler);
  }

  return async (req: EventRequest<T>, res: Response) => {
    const event = {
      ...req.body,
      id: req.body.id ?? req.id,
    };

    await handle(event);

    logger.info(`Event ${event.id} received`);

    if (opts.urlBuilder) {
      res.location(opts.urlBuilder(event));
    }
    res.status(201).send({ id: event.id });
  };
};
