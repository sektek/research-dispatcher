import {
  AbstractEventHandlingService,
  EventHandlingServiceOptions,
} from './event-service.js';
import {
  EventHandler,
  EventHandlerFn,
  EventReturnType,
} from './event-handler.js';
import { Event } from './event.js';

export class SimpleHandler<T extends Event, R extends EventReturnType>
  extends AbstractEventHandlingService<T, R>
  implements EventHandler<T, R>
{
  static from<T extends Event, R extends EventReturnType>(
    opts: EventHandlingServiceOptions<T, R>,
  ): EventHandlerFn<T, R> {
    const eventHandler = new SimpleHandler<T, R>(opts);

    return eventHandler.handle.bind(eventHandler);
  }
}
