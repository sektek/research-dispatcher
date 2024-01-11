import { Event, HttpDispatcher, PromiseDispatcher } from '@sektek/common';

export class PingRequestEventRelay {
  #dispatchers: Map<string, PromiseDispatcher<Event>> = new Map();
  #httpDispatcher: HttpDispatcher<Event>;

  constructor()

  send(event: Event) {
    this.#dispatchers.set(event.id, new PromiseDispatcher<Event>());
  }
}
