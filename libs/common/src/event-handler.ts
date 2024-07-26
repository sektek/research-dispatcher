import { Event } from './event.js';
import { isPrimitive } from './utils.js';

export type EventReturnType = Event | unknown | void;

export type EventHandlerFn<T extends Event, R extends EventReturnType> = (
  event: T,
) => Promise<R>;

interface EventHandlerEvents<T extends Event, R extends EventReturnType> {
  'event:received': (event: T) => void;
  'event:processed': (event: T, result: R) => void;
}

export interface EventHandler<T extends Event, R extends EventReturnType> {
  handle: EventHandlerFn<T, R>;
  on<E extends keyof EventHandlerEvents<T, R>>(
    event: E,
    listener: EventHandlerEvents<T, R>[E],
  ): this;
  emit<E extends keyof EventHandlerEvents<T, R>>(
    event: E,
    ...args: Parameters<EventHandlerEvents<T, R>[E]>
  ): boolean;
}

export const handlerToEventHandlerFn = <
  T extends Event,
  R extends EventReturnType,
>(
  handler: EventHandler<T, R>,
): EventHandlerFn<T, R> => handler.handle.bind(handler);

export const isEventHandler = (
  obj: unknown,
): obj is EventHandler<Event, unknown> =>
  !!obj &&
  !isPrimitive(obj) &&
  (obj as EventHandler<Event, unknown>).handle instanceof Function;
