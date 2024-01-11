import { Event } from './event';

export type EventHandlerFn<T extends Event, R extends Event | void> = (
  event: T,
) => Promise<R>;

export interface EventHandler<T extends Event, R extends Event | void> {
  handle: EventHandlerFn<T, R>;
}
