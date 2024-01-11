import { Event } from './event';
import { EventProcessor } from './event-processor';
import { EventRouter } from './event-router';
import { PromiseDispatcher } from './promise-dispatcher';

export type RouteBuilder<T extends Event> = (event: T) => string;

const DEFAULT_ROUTE_BUILDER: RouteBuilder<Event> = event => event.id;

export interface EventRelayProcessorOptions<T extends Event, R extends Event> {
  router: EventRouter<R>;
  routeBuilder: RouteBuilder<T>;
}

const DEFAULT_OPTIONS: Partial<EventRelayProcessorOptions<Event, Event>> = {
  routeBuilder: DEFAULT_ROUTE_BUILDER,
};

export class EventRelayProcessor<T extends Event, R extends Event>
  implements EventProcessor<T, R>
{
  private readonly eventRouter: EventRouter<R>;

  constructor(options: EventRelayProcessorOptions<T, R>) {
    options = { ...DEFAULT_OPTIONS, ...options };

    this.eventRouter = options.router;
  }

  async process(event: T): Promise<R> {
    const route = event.id;
    const dispatcher = new PromiseDispatcher<R>();

    this.eventRouter.add(route, dispatcher);

    return await dispatcher.get();
  }
}
