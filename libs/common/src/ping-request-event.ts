import { Event } from './event';

type PingRequestData = {
  sentAt: number;
};

type PingRequestType = 'PingRequest';

export type PingRequestEvent = Event & {
  type: PingRequestType;
  data: PingRequestData;
};
