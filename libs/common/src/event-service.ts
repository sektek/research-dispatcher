import { EventChannel, isEventChannel } from './event-channel.js';
import { EventDispatcher, isEventDispatcher } from './event-dispatcher.js';
import {
  EventHandler,
  EventHandlerFn,
  EventReturnType,
  isEventHandler,
} from './event-handler.js';
import { Tracer, trace } from '@opentelemetry/api';
import { Event } from './event.js';
import { Logger } from 'winston';
import { logger } from './logger.js';

export interface EventServiceOptions {
  logger?: Logger;
  name?: string;
}

export interface EventHandlingServiceOptions<
  T extends Event,
  R extends EventReturnType,
> extends EventServiceOptions {
  handler?: EventServiceHandler<T, R>;
}

const SERVICE_NAME_IDS = new Map<string, number>();

const generateName = (prefix: string): string => {
  const id = SERVICE_NAME_IDS.get(prefix) || 0;
  SERVICE_NAME_IDS.set(prefix, id + 1);

  return `${prefix}#${id}`;
};

export abstract class AbstractEventService {
  #logger: Logger;
  #name: string;
  #tracer: Tracer;

  constructor(opts: EventServiceOptions) {
    this.#name = generateName(opts.name || this.constructor.name);
    this.#logger = (opts.logger || logger).child({ component: this.name });
    this.#tracer = trace.getTracer('common', '0.1.0');
  }

  protected get logger(): Logger {
    return this.#logger;
  }

  get name(): string {
    return this.#name;
  }

  get tracer(): Tracer {
    return this.#tracer;
  }
}

export abstract class AbstractEventHandlingService<
    T extends Event,
    R extends EventReturnType,
  >
  extends AbstractEventService
  implements EventHandler<T, R>
{
  #handler: EventHandlerFn<T, R>;

  constructor(opts: EventHandlingServiceOptions<T, R>) {
    super(opts);

    this.#handler = getHandlerFn(
      opts.handler || (DEFAULT_HANDLER as EventHandlerFn<T, R>),
    ) as EventHandlerFn<T, R>;
  }

  protected get handler(): EventHandlerFn<T, R> {
    return this.#handler;
  }

  async handle(event: T): Promise<R> {
    return this.tracer.startActiveSpan(this.name, span => {
      try {
        this.logger.info(
          `${this.name} - Event (${event.type}) ${event.id} received`,
        );
        this.logger.debug(event);
        return this.handler(event);
      } finally {
        span.end();
      }
    });
  }
}

export type EventServiceHandler<T extends Event, R extends EventReturnType> =
  | EventChannel<T>
  | EventDispatcher<T>
  | EventHandler<T, R>
  | EventHandlerFn<T, R>;

const DEFAULT_HANDLER = async (): Promise<unknown> => {
  throw new Error('Event handler not set');
};

export const getHandlerFn = <T extends Event, R extends EventReturnType>(
  handler: EventServiceHandler<T, R>,
): EventHandlerFn<T, unknown> => {
  if (isEventChannel(handler)) {
    return handler.send.bind(handler);
  }
  if (isEventDispatcher(handler)) {
    return handler.dispatch.bind(handler);
  }
  if (isEventHandler(handler)) {
    return handler.handle.bind(handler);
  }

  return handler as EventHandlerFn<T, unknown>;
};
