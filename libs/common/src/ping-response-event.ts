import { Event } from './event';

type PingResponseData = {
  receivedAt: number;
};

type PingResponseType = 'PingResponse';

export type PingResponseEvent = Event & {
  type: PingResponseType;
  data: PingResponseData;
};
