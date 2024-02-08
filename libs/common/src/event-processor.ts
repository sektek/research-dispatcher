import { Event } from './event.js';
import { EventHandlerFn } from './event-handler.js';

export type EventProcessorFn<T extends Event, R extends Event> = EventHandlerFn<
  T,
  R
>;

export interface EventProcessor<T extends Event, R extends Event> {
  process: EventProcessorFn<T, R>;
}
