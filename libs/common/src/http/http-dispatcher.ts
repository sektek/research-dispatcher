import { AbstractEventService, EventServiceOptions } from '../event-service.js';
import { Event } from '../event.js';
import { EventDispatcher } from '../event-dispatcher.js';

interface HttpDispatcherOptions extends EventServiceOptions {
  url: string;
}

export class HttpDispatcher<T extends Event = Event>
  extends AbstractEventService
  implements EventDispatcher<T>
{
  private readonly url: string;

  constructor(options: HttpDispatcherOptions) {
    super(options);

    this.url = options.url;
  }

  async dispatch(event: T) {
    this.logger.info(
      `${this.name} - Event (${event.type}) ${event.id} received`,
    );
    this.logger.debug(event);

    const res = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (res.status !== 201) {
      throw new Error(`Unexpected status code: ${res.status}`);
    }
  }
}
