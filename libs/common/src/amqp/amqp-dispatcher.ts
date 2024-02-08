import { AmqpService, AmqpServiceOptions } from './amqp-service.js';
import { Event } from '../event.js';
import { EventDispatcher } from '../event-dispatcher.js';

interface AmqpDispatcherOptions<T extends Event> extends AmqpServiceOptions<T> {
  persistent?: boolean;
}

export class AmqpDispatcher<T extends Event>
  extends AmqpService<T>
  implements EventDispatcher<T>
{
  private persistent: boolean;

  constructor(options: AmqpDispatcherOptions<T>) {
    super(options);

    this.persistent = options.persistent ?? true;
  }

  static async from(options: AmqpDispatcherOptions<Event>) {
    const connection = await AmqpService.createConnection(options);

    return new AmqpDispatcher({ ...options, connection });
  }

  async dispatch(event: T) {
    this.logger.info(
      `${this.name} - Event (${event.type}) ${event.id} received`,
    );
    this.logger.debug(event);

    (await this.channel()).sendToQueue(
      this.queue,
      Buffer.from(JSON.stringify(event)),
      { persistent: this.persistent },
    );
  }
}
