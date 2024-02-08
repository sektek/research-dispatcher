import {
  AbstractEventHandlingService,
  EventHandlingServiceOptions,
} from './event-service.js';
import {
  EventChannel,
  EventChannelFn,
  channelToEventHandlerFn,
} from './event-channel.js';
import { Event } from './event.js';

export class SimpleChannel<T extends Event>
  extends AbstractEventHandlingService<T, void>
  implements EventChannel<T>
{
  static from(
    opts: EventHandlingServiceOptions<Event, void>,
  ): EventChannelFn<Event> {
    return channelToEventHandlerFn(new SimpleChannel<Event>(opts));
  }

  async send(event: T): Promise<void> {
    await this.handle(event);
  }
}
