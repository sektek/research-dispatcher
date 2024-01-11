import { Event, Listener } from '@sektek/common';

class Listeners {
  #listeners: Map<string, Listener<Event>> = new Map();

  add(id: string) {
    const listener = new Listener<Event>();

    this.#listeners.set(id, listener);

    return listener;
  }

  get(id: string) {
    return this.#listeners.get(id);
  }

  remove(id: string) {
    this.#listeners.delete(id);
  }
}

export const listeners = new Listeners();
