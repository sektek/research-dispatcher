import { Request } from '@sektek/common';
import { Response } from 'express';
import { AmqpDispatcher } from '@sektek/common';

class DispatchHandler {

  constructor() {
  }

  public async handleEvent(req: Request, res: Response) {

    res.sendStatus(204);
  }
}
