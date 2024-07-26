import { errorLogMiddleware, logMiddleware } from '../winston-middleware.js';
import bodyParser from 'body-parser';
import express from 'express';
import { logger } from '../logger.js';
import { requestIdMiddleware } from '../request-id-middleware.js';

export class HttpServer {
  #app: express.Application;
  #router: express.Router;

  constructor() {
    this.#app = express();
    this.#router = express.Router();
    this.#app.use(requestIdMiddleware);
    this.#app.use(bodyParser.json());
    this.#app.use(logMiddleware);
    this.#app.use('/', this.#router);
    this.#app.use(errorLogMiddleware);
  }

  use(...args: Parameters<express.Application['use']>): express.Router {
    return this.#router.use(...args);
  }

  start() {
    const port = process.env.PORT || 3000;
    const server = this.#app.listen(port, () => {
      logger.info(`Server listening on port ${port}`);
    });
    server.on('error', logger.error);
  }
}
