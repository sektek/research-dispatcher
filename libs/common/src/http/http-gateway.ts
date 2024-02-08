import {
  AbstractEventHandlingService,
  EventHandlingServiceOptions,
} from '../event-service.js';
import { Event } from '../event.js';
import { EventRequest } from '../event-request.js';
import { Response } from 'express';

interface HttpListenerOptions<T extends Event>
  extends EventHandlingServiceOptions<T, void> {
  urlBuilder?: (event: T) => string;
}

export class HttpGateway<T extends Event> extends AbstractEventHandlingService<
  T,
  void
> {
  private readonly urlBuilder?: (event: T) => string;

  constructor(opts: HttpListenerOptions<T>) {
    super(opts);

    this.urlBuilder = opts.urlBuilder;
  }

  async handleRequest(req: EventRequest<T>, res: Response): Promise<void> {
    const event = {
      ...req.body,
      id: req.body.id ?? req.id,
    };

    this.logger.info(
      `${this.name} - Event (${event.type}) ${event.id} received`,
    );
    this.logger.debug(event);

    await this.handle(event);

    this.logger.info(`Event ${event.id} received`);

    if (this.urlBuilder) {
      res.location(this.urlBuilder(event));
    }

    res.status(201).send({ id: event.id });
  }

  get requestHandler(): (req: EventRequest<T>, res: Response) => Promise<void> {
    return this.handleRequest.bind(this);
  }
}
