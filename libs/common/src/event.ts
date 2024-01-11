type EventData = Record<string, unknown>;

export type Event = {
  id: string;
  type: string;
  data: EventData;
};

export class QuickTest {
  #id = 'quick-test';

  constructor() {
    this.#id = 'quick-test';
  }

  get id() {
    return this.#id;
  }
}
