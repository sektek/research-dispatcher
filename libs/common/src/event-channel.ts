import { Event } from './event.js';
import { EventHandlerFn } from './event-handler.js';
import { isPrimitive } from './utils.js';

export type EventChannelFn<T extends Event> = EventHandlerFn<T, void>;

export interface EventChannel<T extends Event> {
  send: EventChannelFn<T>;
}

export const channelToEventHandlerFn = <T extends Event>(
  channel: EventChannel<T>,
): EventChannelFn<T> => channel.send.bind(channel);

export const isEventChannel = (obj: unknown): obj is EventChannel<Event> =>
  !!obj &&
  !isPrimitive(obj) &&
  (obj as EventChannel<Event>).send instanceof Function;

export class NullChannel<T extends Event> implements EventChannel<T> {
  static send(): Promise<void> {
    return Promise.resolve();
  }

  send = NullChannel.send;
}
