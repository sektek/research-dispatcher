import { Event } from '../event.js';
import { EventRequest } from './event-request.js';
import { EventReturnType } from '../event-handler.js';
import { Response } from 'express';

export type ResponseHandlerFn<T extends Event, R extends EventReturnType> = (
  event: T,
  result: R,
  req: EventRequest<T>,
  res: Response,
) => Promise<void>;

export const simpleResponseHandler: ResponseHandlerFn<Event, unknown> = async (
  event: Event,
  _result: unknown,
  _req: EventRequest<Event>,
  res: Response,
) => {
  res.status(201).send({ id: event.id });
};

type UrlBuilder = (event: Event) => string;

export const locationAwareResponseHandler = (urlBuilder: UrlBuilder) => {
  return async <T extends Event, R extends EventReturnType>(
    event: T,
    result: R,
    req: EventRequest<T>,
    res: Response,
  ) => {
    res.location(urlBuilder(event));
    await simpleResponseHandler(event, result, req, res);
  };
};
