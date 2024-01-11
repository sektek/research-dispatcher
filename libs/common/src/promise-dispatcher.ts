import { Event } from './event';
import { EventDispatcher } from './event-dispatcher';

export class PromiseDispatcher<T extends Event> implements EventDispatcher<T> {
  private promise: Promise<T>;
  resolve?: (value: T | PromiseLike<T>) => void;
  reject?: (reason?: unknown) => void;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  get(): Promise<T> {
    return this.promise;
  }

  async send(value: T) {
    if (!this.resolve) {
      throw new Error('Listener not initialized');
    }
    this.resolve(value);
  }
}
