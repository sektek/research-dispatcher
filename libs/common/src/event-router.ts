import { AbstractEventService, EventServiceOptions } from './event-service.js';
import {
  EventChannel,
  EventChannelFn,
  NullChannel,
  channelToEventHandlerFn,
  isEventChannel,
} from './event-channel.js';
import { EventHandler, EventHandlerFn } from './event-handler.js';
import { Event } from './event.js';
import { EventDispatcher } from './event-dispatcher.js';
import { SimpleChannel } from './simple-channel.js';

export type EventRouteDecider<T extends Event> = (event: T) => Promise<string>;

const DEFAULT_ROUTE_DECIDER: EventRouteDecider<Event> = async () => '';

type EventRoute<T extends Event> =
  | EventChannel<T>
  | EventDispatcher<T>
  | EventHandler<T, unknown>
  | EventHandlerFn<T, unknown>;

const eventRouteToChannelFn = <T extends Event>(
  name: string,
  handler: EventRoute<T>,
): EventChannelFn<T> => {
  if (isEventChannel(handler)) {
    return channelToEventHandlerFn(handler);
  }

  return SimpleChannel.from({
    name,
    handler: handler as EventHandlerFn<T, void>,
  });
};

interface EventRouterOptions<T extends Event> extends EventServiceOptions {
  routeDecider?: EventRouteDecider<T>;
  defaultRoute?: EventRoute<T>;
}

const DEFAULT_ROUTER_OPTIONS: EventRouterOptions<Event> = {
  defaultRoute: NullChannel,
  routeDecider: DEFAULT_ROUTE_DECIDER,
};

export class EventRouter<T extends Event>
  extends AbstractEventService
  implements EventChannel<T>
{
  private readonly routes: Map<string, EventChannelFn<T>> = new Map();
  protected readonly routeDecider: EventRouteDecider<T>;
  private readonly defaultRoute: EventChannelFn<T>;

  constructor(options: EventRouterOptions<T> = DEFAULT_ROUTER_OPTIONS) {
    super(options);

    this.routeDecider = options.routeDecider ?? DEFAULT_ROUTE_DECIDER;
    this.defaultRoute = eventRouteToChannelFn(
      `${this.name}-default`,
      options.defaultRoute ?? NullChannel,
    );
  }

  add(route: string, handler: EventRoute<T>): void {
    this.routes.set(
      route,
      eventRouteToChannelFn(`${this.name}-${route}`, handler),
    );
  }

  remove(route: string): void {
    this.routes.delete(route);
  }

  async send(event: T, route?: string): Promise<void> {
    route ??= await this.routeDecider(event);
    const handler = this.routes.get(route) ?? this.defaultRoute;

    await handler(event);
  }
}

export class SingleUseRouter<T extends Event> extends EventRouter<T> {
  async send(event: T, route?: string): Promise<void> {
    route ??= await this.routeDecider(event);
    await super.send(event, route);
    this.remove(route);
  }
}
