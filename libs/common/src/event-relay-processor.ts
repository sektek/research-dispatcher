import {
  AbstractEventHandlingService,
  EventHandlingServiceOptions,
} from './event-service.js';
import { EventChannelFn, NullChannel } from './event-channel.js';
import { EventRouteDecider, RouteProvider } from './event-router.js';
import { Event } from './event.js';
import { EventHandler } from './event-handler.js';
import { PromiseChannel } from './promise-channel.js';

export type RouteBuilder<T extends Event> = (event: T) => string;

const DEFAULT_ROUTE_DECIDER: EventRouteDecider<Event> = async event => event.id;

export interface EventRelayProcessorOptions<T extends Event, R extends Event>
  extends EventHandlingServiceOptions<T, R> {
  inboundRouteDecider?: EventRouteDecider<T>;
  outbountRouteDecider?: EventRouteDecider<R>;
}

export class EventRelayProcessor<T extends Event, R extends Event>
  extends AbstractEventHandlingService<T, R>
  implements EventHandler<T, R>, RouteProvider<R>
{
  #channelMap = new Map<string, PromiseChannel<R>>();
  #inboundRouteDecider: EventRouteDecider<T>;
  #outboundRouteDecider: EventRouteDecider<R>;
  #defaultChannel = new NullChannel<R>();

  constructor(options: EventRelayProcessorOptions<T, R>) {
    super(options);

    this.#inboundRouteDecider =
      options.inboundRouteDecider || DEFAULT_ROUTE_DECIDER;
    this.#outboundRouteDecider =
      options.outbountRouteDecider || DEFAULT_ROUTE_DECIDER;
  }

  async handle(event: T): Promise<R> {
    const route = await this.#inboundRouteDecider(event);
    const channel = new PromiseChannel<R>();

    this.#channelMap.set(route, channel);

    await super.handle(event);

    return await channel.get();
  }

  async get(event: R): Promise<EventChannelFn<R>> {
    const route = await this.#outboundRouteDecider(event);
    const channel = this.#channelMap.get(route);

    if (channel) {
      this.#channelMap.delete(route);
    }

    return channel?.send?.bind(channel) ?? this.#defaultChannel.send;
  }
}
