import { EventProcessor, EventProcessorFn } from './event-processor';
import { Event } from './event';
import { EventRequest } from './event-request';
import { Logger } from 'winston';
import { Response } from 'express';

type HttpProcessorProcessor<T extends Event, R extends Event> =
  | EventProcessor<T, R>
  | EventProcessorFn<T, R>;

interface HttpProcessorOptions<T extends Event, R extends Event> {
  logger: Logger;
  processor: HttpProcessorProcessor<T, R>;
}

export const httpProcessor = <T extends Event, R extends Event>(
  opts: HttpProcessorOptions<T, R>,
) => {
  const { logger, processor } = opts;

  let process: EventProcessorFn<T, R>;
  if (typeof processor === 'function') {
    process = processor;
  } else {
    process = processor.process.bind(processor);
  }

  return async (req: EventRequest<T>, res: Response) => {
    const event = {
      ...req.body,
      id: req.body.id ?? req.id,
    };

    logger.info(`Event ${event.id} received`);
    const result = await process(event);
    logger.info(`Event ${event.id} processed`);

    res.send(result);
  };
};
