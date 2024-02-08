import {
  AbstractEventHandlingService,
  EventHandlingServiceOptions,
} from './event-service.js';
import {
  EventRouteDecider,
  EventRouter,
  SingleUseRouter,
} from './event-router.js';
import { Event } from './event.js';
import { EventHandler } from './event-handler.js';
import { PromiseChannel } from './promise-channel.js';

export type RouteBuilder<T extends Event> = (event: T) => string;

const DEFAULT_ROUTE_DECIDER: EventRouteDecider<Event> = async event => event.id;

export interface EventRelayProcessorOptions<T extends Event, R extends Event>
  extends EventHandlingServiceOptions<T, R> {
  router?: EventRouter<R>;
  routeDecider?: EventRouteDecider<T>;
}

export class EventRelayProcessor<T extends Event, R extends Event>
  extends AbstractEventHandlingService<T, R>
  implements EventHandler<T, R>
{
  #eventRouter: EventRouter<R>;
  #routeDecider: EventRouteDecider<T>;

  constructor(options: EventRelayProcessorOptions<T, R>) {
    super(options);

    this.#routeDecider = options.routeDecider || DEFAULT_ROUTE_DECIDER;
    this.#eventRouter =
      options.router ||
      new SingleUseRouter<R>({
        routeDecider: DEFAULT_ROUTE_DECIDER,
      });
  }

  async handle(event: T): Promise<R> {
    const route = await this.#routeDecider(event);
    const channel = new PromiseChannel<R>();

    this.#eventRouter.add(route, channel);

    await super.handle(event);

    return await channel.get();
  }
}
