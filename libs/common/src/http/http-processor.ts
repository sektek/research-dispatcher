import {
  AbstractEventHandlingService,
  EventHandlingServiceOptions,
} from '../event-service.js';
import { Event } from '../event.js';
import { EventRequest } from '../event-request.js';
import { Response } from 'express';

type ResponseSerializer<R extends Event> = (event: R) => PromiseLike<R>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PASS_THROUGH_RESPONSE_SERIALIZER: ResponseSerializer<
  Event
> = async event => event;

interface HttpProcessorOptions<T extends Event, R extends Event>
  extends EventHandlingServiceOptions<T, R> {
  responseSerializer?: ResponseSerializer<R>;
}

export class HttpProcessor<
  T extends Event,
  R extends Event,
> extends AbstractEventHandlingService<T, R> {
  #responseSerializer: ResponseSerializer<R>;

  constructor(opts: HttpProcessorOptions<T, R>) {
    super(opts);

    this.#responseSerializer =
      opts.responseSerializer ||
      (PASS_THROUGH_RESPONSE_SERIALIZER as ResponseSerializer<R>);
  }

  async handleRequest(req: EventRequest<T>, res: Response): Promise<void> {
    const event = {
      ...req.body,
      id: req.body.id ?? req.id,
    };

    const result = await this.handle(event);
    this.logger.info(
      `${this.name} - Result (${result.type}) ${result.id} received`,
    );
    this.logger.debug(result);

    res.send(await this.#responseSerializer(result));
  }

  get requestHandler(): (req: EventRequest<T>, res: Response) => Promise<void> {
    return this.handleRequest.bind(this);
  }
}
