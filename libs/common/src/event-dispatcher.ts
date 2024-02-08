import { Event } from './event.js';
import { EventHandlerFn } from './event-handler.js';
import { isPrimitive } from './utils.js';

export type EventDispatcherFn<T extends Event> = EventHandlerFn<T, void>;

export interface EventDispatcher<T extends Event> {
  dispatch: EventDispatcherFn<T>;
}

export const dispatcherToEventHandlerFn = <T extends Event>(
  dispatcher: EventDispatcher<T>,
): EventDispatcherFn<T> => dispatcher.dispatch.bind(dispatcher);

export const isEventDispatcher = (
  obj: unknown,
): obj is EventDispatcher<Event> =>
  !!obj &&
  !isPrimitive(obj) &&
  (obj as EventDispatcher<Event>).dispatch instanceof Function;
