import {
  AbstractEventHandlingService,
  EventHandlingServiceOptions,
} from '../event-service.js';
import { EventExtractorFn, simpleEventExtractor } from './event-extractor.js';
import { EventHandlerEvents, EventReturnType } from '../event-handler.js';
import {
  ResponseHandlerFn,
  simpleResponseHandler,
} from './response-handler.js';
import { Event } from '../event.js';
import { EventRequest } from './event-request.js';
import { Response } from 'express';

const EVENT_REQUEST_RECEIVED = 'request:received';

interface HttpEventRequestHandlerEvents<
  T extends Event,
  R extends EventReturnType,
> extends EventHandlerEvents<T, R> {
  [EVENT_REQUEST_RECEIVED]: (req: EventRequest<T>) => void;
}

interface HttpEventRequestHandler<T extends Event, R extends EventReturnType> {
  on<E extends keyof HttpEventRequestHandlerEvents<T, R>>(
    event: E,
    listener: HttpEventRequestHandlerEvents<T, R>[E],
  ): this;
  emit<E extends keyof HttpEventRequestHandlerEvents<T, R>>(
    event: E,
    ...args: Parameters<HttpEventRequestHandlerEvents<T, R>[E]>
  ): boolean;
}

export interface HttpEventRequestHandlerOptions<
  T extends Event,
  R extends EventReturnType,
> extends EventHandlingServiceOptions<T, R> {
  eventExtractor?: EventExtractorFn<T>;
  responseHandler?: ResponseHandlerFn<T, R>;
}

export class SimpleHttpEventRequestHandler<
    T extends Event,
    R extends EventReturnType,
  >
  extends AbstractEventHandlingService<T, R>
  implements HttpEventRequestHandler<T, R>
{
  #eventExtractor: EventExtractorFn<T>;
  #ResponseHandler: ResponseHandlerFn<T, R>;

  constructor(opts: HttpEventRequestHandlerOptions<T, R>) {
    super(opts);
    this.#eventExtractor =
      opts.eventExtractor || (simpleEventExtractor as EventExtractorFn<T>);
    this.#ResponseHandler = opts.responseHandler || simpleResponseHandler;
  }

  async handleRequest(req: EventRequest<T>, res: Response): Promise<void> {
    this.emit(EVENT_REQUEST_RECEIVED, req);
    this.logger.info({
      service: this.name,
      action: EVENT_REQUEST_RECEIVED,
      requestId: req.id,
    });

    const event = this.#eventExtractor(req);
    const result = await this.handle(event);
    this.logger.info({ service: this.name, requestId: req.id, result });

    this.responseHandler(event, result, req, res);
  }

  get eventExtractor(): EventExtractorFn<T> {
    return this.#eventExtractor;
  }

  get responseHandler(): ResponseHandlerFn<T, R> {
    return this.#ResponseHandler;
  }

  protected set responseHandler(handler: ResponseHandlerFn<T, R>) {
    this.#ResponseHandler = handler;
  }

  get requestHandler(): (req: EventRequest<T>, res: Response) => Promise<void> {
    return this.handleRequest.bind(this);
  }
}
