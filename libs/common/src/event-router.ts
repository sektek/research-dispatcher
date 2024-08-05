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

export type EventRoute<T extends Event> =
  | EventChannel<T>
  | EventDispatcher<T>
  | EventHandler<T, unknown>
  | EventHandlerFn<T, unknown>;

export const eventRouteToChannelFn = <T extends Event>(
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

export type RouteProviderFn<T extends Event> = (
  event: T,
) => Promise<EventChannelFn<T>>;

const DEFAULT_ROUTE_PROVIDER: RouteProviderFn<Event> = async () =>
  NullChannel.send;

export interface RouteProvider<T extends Event> {
  get: RouteProviderFn<T>;
}

interface RouteStoreOptions<T extends Event> extends EventServiceOptions {
  routeDecider: EventRouteDecider<T>;
  defaultRoute?: EventRoute<T>;
}

const DEFAULT_ROUTE_STORE_OPTIONS: RouteStoreOptions<Event> = {
  routeDecider: DEFAULT_ROUTE_DECIDER,
  defaultRoute: NullChannel,
};

export class RouteStore<T extends Event>
  extends AbstractEventService
  implements RouteProvider<T>
{
  protected routeDecider: EventRouteDecider<T>;
  routes: Map<string, EventChannelFn<T>> = new Map();
  protected readonly defaultRoute: EventChannelFn<T>;

  constructor(options: RouteStoreOptions<T> = DEFAULT_ROUTE_STORE_OPTIONS) {
    super({ ...DEFAULT_ROUTE_STORE_OPTIONS, ...options });

    options = { ...DEFAULT_ROUTE_STORE_OPTIONS, ...options };
    this.routeDecider = options.routeDecider ?? DEFAULT_ROUTE_DECIDER;
    this.defaultRoute = eventRouteToChannelFn(
      `${this.name}-DEFAULT`,
      options.defaultRoute ?? NullChannel,
    );
  }

  add(route: string, handler: EventRoute<T>): void {
    this.routes.set(
      route,
      eventRouteToChannelFn(`${this.name}-${route}`, handler),
    );
  }

  async get(event: T): Promise<EventChannelFn<T>> {
    const route = await this.routeDecider(event);
    return this.routes.get(route) ?? this.defaultRoute;
  }

  remove(route: string): void {
    this.routes.delete(route);
  }
}

export class SingleUseRouteStore<T extends Event> extends RouteStore<T> {
  async get(event: T): Promise<EventChannelFn<T>> {
    const route = await this.routeDecider(event);
    const handler = this.routes.get(route);
    this.remove(route);

    return handler ?? this.defaultRoute;
  }
}

interface EventRouterOptions<T extends Event> extends EventServiceOptions {
  routeProvider?: RouteProvider<T> | RouteProviderFn<T>;
}

const DEFAULT_ROUTER_OPTIONS: EventRouterOptions<Event> = {
  routeProvider: DEFAULT_ROUTE_PROVIDER,
};

export class EventRouter<T extends Event>
  extends AbstractEventService
  implements EventChannel<T>
{
  private readonly routeProvider: RouteProviderFn<T>;

  constructor(options: EventRouterOptions<T> = DEFAULT_ROUTER_OPTIONS) {
    super(options);

    this.routeProvider =
      options.routeProvider instanceof Function
        ? options.routeProvider
        : options.routeProvider?.get?.bind(options.routeProvider) ??
          DEFAULT_ROUTE_PROVIDER;
  }

  async send(event: T): Promise<void> {
    const handler = await this.routeProvider(event);
    await handler(event);
  }
}
