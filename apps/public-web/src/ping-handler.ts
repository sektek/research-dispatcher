import { PingRequestEvent, Request } from '@sektek/common';
import { Response } from 'express';
import { dispatch } from './dispatch';

interface PingRequest extends Request {
  body: Partial<PingRequestEvent>;
}

export const pingHandler = async ({ id, body }: PingRequest, res: Response) => {
  const event = {
    id: body.id ?? id,
    type: 'ping-request',
    data: {
      sentAt: body.data?.sentAt ?? Date.now(),
    },
  };

  res.send(await dispatch(event));
};
