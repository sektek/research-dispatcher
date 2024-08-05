import {
  HttpEventRequestHandlerOptions,
  SimpleHttpEventRequestHandler,
} from './http-event-request-handler.js';
import { Event } from '../event.js';
import { locationAwareResponseHandler } from './response-handler.js';

interface HttpListenerOptions<T extends Event>
  extends HttpEventRequestHandlerOptions<T, void> {
  urlBuilder?: (event: T) => string;
}

export class HttpGateway<T extends Event> extends SimpleHttpEventRequestHandler<
  T,
  void
> {
  private readonly urlBuilder?: (event: T) => string;

  constructor(opts: HttpListenerOptions<T>) {
    super(opts);

    if (!opts.responseHandler && opts.urlBuilder) {
      this.responseHandler = locationAwareResponseHandler(opts.urlBuilder);
    }
  }
}
