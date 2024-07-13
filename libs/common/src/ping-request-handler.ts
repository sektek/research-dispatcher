import { PingRequestEvent } from './ping-request-event.js';
import { PingResponseEvent } from './ping-response-event.js';

export const pingRequestHandler = async (
  event: PingRequestEvent,
): Promise<PingResponseEvent> => {
  return {
    ...event,
    type: 'PingResponse',
    data: {
      ...(event.data ?? {}),
      receivedAt: new Date().getTime(),
    },
  };
};
