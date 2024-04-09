import { telemetry } from './src/instrumentation.js';
// eslint-disable-next-line sort-imports
import {
  errorLogMiddleware,
  logMiddleware,
  logger,
  requestIdMiddleware,
} from '@sektek/common';
import bodyParser from 'body-parser';
import { app as dispatcherApp } from './src/app.js';
import express from 'express';

telemetry.start();

const app = express();
const port = process.env.PORT || 3000;
app.use(requestIdMiddleware);
app.use(bodyParser.json());
app.use(logMiddleware);

app.use('/', dispatcherApp);
app.use(errorLogMiddleware);

const server = app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});
server.on('error', logger.error);
