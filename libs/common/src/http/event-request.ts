import { Event } from '../event.js';
import { Request } from './request.js';

export interface EventRequest<T extends Event = Event> extends Request {
  body: T;
}
