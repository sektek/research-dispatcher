import { Event } from './event.js';

type PingResponseData = {
  receivedAt: number;
};

type PingResponseType = 'PingResponse';

export type PingResponseEvent = Event & {
  type: PingResponseType;
  data: PingResponseData;
};
