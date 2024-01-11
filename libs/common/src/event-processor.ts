import { Event } from './event';
import { EventHandlerFn } from './event-handler';

export type EventProcessorFn<T extends Event, R extends Event> = EventHandlerFn<
  T,
  R
>;

export interface EventProcessor<T extends Event, R extends Event> {
  process: EventProcessorFn<T, R>;
}
