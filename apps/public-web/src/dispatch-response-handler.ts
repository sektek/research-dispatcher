import { Request } from '@sektek/common';
import { Response } from 'express';
import { listeners } from './listeners';

export const dispatchResponseHandler = async (req: Request, res: Response) => {
  const { body } = req;

  const listener = listeners.get(body.id);
  listener?.send(body);
  listeners.remove(body.id);

  res.sendStatus(204);
};
