import { Event } from './event';
import { Request } from './request';

export interface EventRequest<T extends Event> extends Request {
  body: T;
}
