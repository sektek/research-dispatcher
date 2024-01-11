import { Event } from './event';
import { EventDispatcher } from './event-dispatcher';

export class HttpDispatcher<T extends Event> implements EventDispatcher<T> {
  constructor(private url: string) {}

  async send(event: T) {
    const res = await fetch(this.url, {
      method: 'POST',
      body: JSON.stringify(event),
    });

    if (res.status !== 204) {
      throw new Error(`Unexpected status code: ${res.status}`);
    }
  }
}
