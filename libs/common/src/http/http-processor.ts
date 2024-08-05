import {
  HttpEventRequestHandlerOptions,
  SimpleHttpEventRequestHandler,
} from './http-event-request-handler.js';
import { Event } from '../event.js';
import { EventRequest } from './event-request.js';
import { Response } from 'express';

type ResponseSerializer<R extends Event> = (event: R) => PromiseLike<R>;

const PASS_THROUGH_RESPONSE_SERIALIZER: ResponseSerializer<
  Event
> = async event => event;

class ProcessorResponseHandler<T extends Event, R extends Event> {
  #responseSerializer: ResponseSerializer<R> =
    PASS_THROUGH_RESPONSE_SERIALIZER as ResponseSerializer<R>;

  constructor(responseSerializer?: ResponseSerializer<R>) {
    if (responseSerializer) {
      this.#responseSerializer = responseSerializer;
    }
  }

  async handleResponse(
    _event: T,
    result: R,
    _req: EventRequest<T>,
    res: Response,
  ): Promise<void> {
    res.send(await this.#responseSerializer(result));
  }
}

interface HttpProcessorOptions<T extends Event, R extends Event>
  extends HttpEventRequestHandlerOptions<T, R> {
  responseSerializer?: ResponseSerializer<R>;
}

export class HttpProcessor<
  T extends Event,
  R extends Event,
> extends SimpleHttpEventRequestHandler<T, R> {
  constructor(opts: HttpProcessorOptions<T, R>) {
    super(opts);

    if (!opts.responseHandler) {
      const responseHandler = new ProcessorResponseHandler<T, R>(
        opts.responseSerializer,
      );
      this.responseHandler =
        responseHandler.handleResponse.bind(responseHandler);
    }
  }
}
