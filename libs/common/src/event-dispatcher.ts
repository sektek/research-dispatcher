import { Event } from './event';
import { EventHandlerFn } from './event-handler';

export interface EventDispatcher<T extends Event> {
  send: EventHandlerFn<T, void>;
}

export class NullEventDispatcher {
  static send(): Promise<void> {
    return Promise.resolve();
  }
}
