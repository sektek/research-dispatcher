import {
  AbstractEventHandlingService,
  EventHandlingServiceOptions,
} from '../event-service.js';
import { Channel, Connection, Options, connect as amqpConnect } from 'amqplib';
import { Event } from '../event.js';

export interface AmqpServiceOptions<T extends Event>
  extends EventHandlingServiceOptions<T, unknown>,
    Options.Connect {
  connection?: Connection;
  url?: string;
  queue: string;
}

export abstract class AmqpService<
  T extends Event,
> extends AbstractEventHandlingService<T, unknown> {
  #channel?: Channel;
  #connection?: Connection;
  #queue: string;

  constructor(opts: AmqpServiceOptions<T>) {
    super(opts);

    this.#connection = opts.connection;
    this.#queue = opts.queue;
  }

  static async createConnection(options: AmqpServiceOptions<Event>) {
    if (options.connection) {
      return options.connection;
    }

    return await amqpConnect(options.url ?? options);
  }

  protected async channel() {
    if (!this.#channel) {
      this.#channel = await this.connection().createChannel();
      await this.#channel.assertQueue(this.#queue, { durable: true });
    }
    return this.#channel;
  }

  protected connection() {
    if (!this.#connection) {
      throw new Error('Connection not found');
    }
    return this.#connection;
  }

  protected get queue() {
    return this.#queue;
  }
}
