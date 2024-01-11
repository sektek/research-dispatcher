import { EventDispatcher, NullEventDispatcher } from './event-dispatcher';
import { Event } from './event';

type EventRouteDecider<T extends Event> = (event: T) => Promise<string>;

const DEFAULT_ROUTE_DECIDER: EventRouteDecider<Event> = async () => '';

interface EventRouterOptions<T extends Event> {
  routeDecider: EventRouteDecider<T>;
  defaultRoute: EventDispatcher<T>;
  singleUseRoutes?: boolean;
}

const DEFAULT_ROUTER_OPTIONS: Partial<EventRouterOptions<Event>> = {
  defaultRoute: NullEventDispatcher,
  routeDecider: DEFAULT_ROUTE_DECIDER,
  singleUseRoutes: false,
};

export class EventRouter<T extends Event> implements EventDispatcher<T> {
  private readonly routes: Map<string, EventDispatcher<T>> = new Map();
  private readonly singleUseRoutes: boolean = false;
  private readonly routeDecider: EventRouteDecider<T>;
  private readonly defaultRoute: EventDispatcher<T>;

  constructor(options: EventRouterOptions<T>) {
    options = { ...DEFAULT_ROUTER_OPTIONS, ...options };
    this.routeDecider = options.routeDecider;
    this.defaultRoute = options.defaultRoute;
    this.singleUseRoutes = options.singleUseRoutes ?? false;
  }

  add(route: string, handler: EventDispatcher<T>): void {
    this.routes.set(route, handler);
  }

  remove(route: string): void {
    this.routes.delete(route);
  }

  async send(event: T): Promise<void> {
    const route = await this.routeDecider(event);
    const handler = this.routes.get(route) ?? this.defaultRoute;

    await handler.send(event);

    if (this.singleUseRoutes) {
      this.remove(route);
    }
  }
}
