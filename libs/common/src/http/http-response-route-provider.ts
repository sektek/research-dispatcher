import { AbstractEventService, EventServiceOptions } from '../event-service.js';
import { EventChannel, EventChannelFn, NullChannel } from '../event-channel.js';
import { RouteProvider, eventRouteToChannelFn } from '../event-router.js';
import { Event } from '../event.js';
import { EventRequest } from './event-request.js';
import { HttpDispatcher } from './http-dispatcher.js';
import { HttpGateway } from './http-gateway.js';

type UrlBuilderFn<T extends Event = Event> = (
  request: EventRequest<T>,
) => string;

export interface HttpDispatcherOptions<T extends Event>
  extends EventServiceOptions {
  httpGateway: HttpGateway<Event>;
  urlBuilder?: UrlBuilderFn<T>;
  defaultRoute?: EventChannel<T> | EventChannelFn<T>;
}

const DEFAULT_URL_BUILDER = (request: EventRequest) => {
  let { ip } = request;
  if (ip?.includes(':')) {
    ip = `[${ip}]`;
  }
  return `http://${ip}:3000/dispatch`;
};

const DEFAULT_ROUTE = new NullChannel();

export class HttpResponseRouteProvider<T extends Event = Event>
  extends AbstractEventService
  implements RouteProvider<T>
{
  #eventIdResponseUrlMap = new Map<string, string>();
  #routes = new Map<string, EventChannelFn<T>>();
  #defaultRoute: EventChannelFn<T>;
  #urlBuilder: UrlBuilderFn<T>;

  constructor(options: HttpDispatcherOptions<T>) {
    super(options);

    this.#defaultRoute = eventRouteToChannelFn(
      `${this.name}-default-route`,
      options.defaultRoute ?? DEFAULT_ROUTE,
    );

    this.#urlBuilder =
      options.urlBuilder ?? (DEFAULT_URL_BUILDER as UrlBuilderFn<T>);

    options.httpGateway.addListener(
      'request:received',
      this.#requestReceivedListener.bind(this),
    );
  }

  async get(event: T): Promise<EventChannelFn<T>> {
    const { id } = event;
    const url = this.#eventIdResponseUrlMap.get(id);
    if (!url) {
      return this.#defaultRoute;
    }

    if (!this.#routes.has(url)) {
      const httpDispatcher = new HttpDispatcher({ url });
      this.#routes.set(
        url,
        eventRouteToChannelFn(`${this.name}-${url}`, httpDispatcher),
      );
    }
    return this.#routes.get(url) ?? this.#defaultRoute;
  }

  async #requestReceivedListener(request: EventRequest<T>) {
    const eventId = request.body.id;
    const url = this.#urlBuilder(request);
    this.#eventIdResponseUrlMap.set(eventId, url);
  }
}
