import {
  AbstractEventHandlingService,
  EventHandlingServiceOptions,
} from '../event-service.js';
import { Event } from '../event.js';
import { EventRequest } from './event-request.js';
import { EventReturnType } from '../event-handler.js';
import { Response } from 'express';

type ResponseHandlerFn<T extends Event, R extends EventReturnType> = (
  event: T,
  result: R,
  req: EventRequest<T>,
  res: Response,
) => Promise<void>;

interface HttpEventRequestHandlerEvents<T extends Event> {
  'request:received': (req: EventRequest<T>) => void;
}

const DEFAULT_RESPONSE_HANDLER: ResponseHandlerFn<T extends Event, unknown> = async (event: T) => {
  res.status(201).send({ id: event.id });
};

interface HttpEventRequestHandler<T extends Event, R extends EventReturnType> {
  on<E extends keyof HttpEventRequestHandlerEvents<T>>(
    event: E,
    listener: HttpEventRequestHandlerEvents<T>[E],
  ): this;
  emit<E extends keyof HttpEventRequestHandlerEvents<T>>(
    event: E,
    ...args: Parameters<HttpEventRequestHandlerEvents<T>[E]>
  ): boolean;
}

export class SimpleHttpEventRequestHandler<
    T extends Event,
    R extends EventReturnType,
  >
  extends AbstractEventHandlingService<T, void>
  implements HttpEventRequestHandler<T, R>
{
  constructor(opts: EventHandlingServiceOptions<T, void>) {
    super(opts);
  }

  async handleRequest(req: EventRequest<T>, res: Response): Promise<void> {
    const event = {
      ...req.body,
      id: req.body.id ?? req.id,
    };

    this.logger.info(
      `${this.name} - Event (${event.type}) ${event.id} received`,
    );
    this.logger.debug(event);

    await this.handle(event);

    this.logger.info(`Event ${event.id} received`);

  }

  get responseHandler(): ResponseHandlerFn<R> {
    return DEFAULT_RESPONSE_HANDLER as ResponseHandlerFn<R>;
  }

  get requestHandler(): (req: EventRequest<T>, res: Response) => Promise<void> {
    return this.handleRequest.bind(this);
  }
}
