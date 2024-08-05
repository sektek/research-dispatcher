import { Event } from '../event.js';
import { EventRequest } from './event-request.js';

export type EventExtractorFn<T extends Event> = (req: EventRequest<T>) => T;

export const simpleEventExtractor: EventExtractorFn<Event> = (
  req: EventRequest<Event>,
) => ({
  ...req.body,
  id: req.body.id ?? req.id,
});
