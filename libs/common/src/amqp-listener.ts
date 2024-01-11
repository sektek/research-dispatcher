import {
  Channel,
  Connection,
  ConsumeMessage,
  Options,
  connect as amqpConnect,
} from 'amqplib';
import { Event } from './event';
import { Logger } from 'winston';

interface AmqpBuildOptions extends Options.Connect {
  logger: Logger;
  queue: string;
  connection?: Connection;
  url?: string;
  handler: (event: Event) => Promise<void>;
}

interface AmqpListenerOptions {
  logger: Logger;
  connection: Connection;
  queue: string;
  handler: (event: Event) => Promise<void>;
}

export class AmqpListener<T extends Event> {
  private connection: Connection;
  private logger: Logger;
  private queue: string;
  private handler: (event: Event) => Promise<void>;
  #channel?: Channel;

  constructor(options: AmqpListenerOptions) {
    this.logger = options.logger;
    this.connection = options.connection;
    this.queue = options.queue;
    this.handler = options.handler;
  }

  static async from(options: AmqpBuildOptions) {
    let _connection = options.connection;
    if (!options.connection) {
      _connection = await amqpConnect(options.url || options);
    }

    if (!_connection) {
      throw new Error('Connection not found');
    }

    return new AmqpListener({
      logger: options.logger,
      connection: _connection,
      queue: options.queue,
      handler: options.handler,
    });
  }

  async start() {
    const channel = await this.channel();
    channel.consume(this.queue, this.handleMessage);
  }

  private async channel() {
    if (!this.#channel) {
      this.#channel = await this.connection.createChannel();
      await this.#channel.assertQueue(this.queue, { durable: true });
    }
    return this.#channel;
  }

  async handleMessage(message: ConsumeMessage | null) {
    if (message) {
      const event = JSON.parse(message.content.toString()) as T;
      try {
        await this.handler(event);
        (await this.channel()).ack(message);
        this.logger.info(`Processed ${event.id}`);
      } catch (error) {
        this.logger.error(`Failed to process ${event.id}: ${error.message}`);
        (await this.channel()).nack(message);
      }
    }
  }
}
