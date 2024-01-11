import { Channel, Connection, Options, connect as amqpConnect } from 'amqplib';
import { Event } from './event';
import { EventDispatcher } from './event-dispatcher';

interface AmqpBuildOptions extends Options.Connect {
  queue: string;
  connection?: Connection;
  url?: string;
  persistent?: boolean;
}

const DEFAULT_OPTIONS: Partial<AmqpBuildOptions> = {
  persistent: true,
};

export class AmqpDispatcher<T extends Event> implements EventDispatcher<T> {
  #channel?: Channel;

  constructor(
    private connection: Connection,
    private queue: string,
  ) {}

  static async from(options: AmqpBuildOptions) {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let _connection = opts.connection;
    if (!options.connection) {
      _connection = await amqpConnect(opts.url ?? opts);
    }

    if (!_connection) {
      throw new Error('Connection not found');
    }

    return new AmqpDispatcher(_connection, options.queue);
  }

  async send(event: T) {
    (await this.channel()).sendToQueue(
      this.queue,
      Buffer.from(JSON.stringify(event)),
      { persistent: true },
    );
  }

  private async channel() {
    if (!this.#channel) {
      this.#channel = await this.connection.createChannel();
      await this.#channel.assertQueue(this.queue, { durable: true });
    }
    return this.#channel;
  }
}
