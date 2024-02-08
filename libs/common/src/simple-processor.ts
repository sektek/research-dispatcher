import {
  AbstractEventHandlingService,
  EventHandlingServiceOptions,
  EventServiceHandler,
  getHandlerFn,
} from './event-service.js';
import { Event } from './event.js';
import { EventHandlerFn } from './event-handler.js';

interface EventProcessorOptions<T extends Event, R extends Event>
  extends EventHandlingServiceOptions<T, R> {
  responseHandler: EventServiceHandler<R, unknown>;
}

export class SimpleProcessor<
  T extends Event,
  R extends Event,
> extends AbstractEventHandlingService<T, R> {
  #responseHandler: EventHandlerFn<R, unknown>;

  constructor(opts: EventProcessorOptions<T, R>) {
    super(opts);

    this.#responseHandler = getHandlerFn(opts.responseHandler);
  }

  async handle(event: T): Promise<R> {
    const response = await super.handle(event);

    await this.#responseHandler(response);

    return response;
  }
}
