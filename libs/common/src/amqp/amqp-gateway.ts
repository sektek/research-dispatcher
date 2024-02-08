import { AmqpService, AmqpServiceOptions } from './amqp-service.js';
import { ConsumeMessage } from 'amqplib';
import { Event } from '../event.js';

interface AmqpListenerOptions<T extends Event> extends AmqpServiceOptions<T> {}

export class AmqpGateway<T extends Event> extends AmqpService<T> {
  constructor(options: AmqpListenerOptions<T>) {
    super(options);
  }

  static async from(options: AmqpListenerOptions<Event>) {
    const connection = await AmqpService.createConnection(options);

    return new AmqpGateway({
      ...options,
      connection,
    });
  }

  async start() {
    (await this.channel()).consume(this.queue, this.handleMessage.bind(this));
  }

  async handleMessage(message: ConsumeMessage | null) {
    if (message) {
      const event = JSON.parse(message.content.toString()) as T;
      try {
        await this.handle(event);
        (await this.channel()).ack(message);
        this.logger.info(`Processed ${event.id}`);
      } catch (error) {
        this.logger.error(`Failed to process ${event.id}: ${error.message}`);
        (await this.channel()).nack(message);
      }
    }
  }
}
