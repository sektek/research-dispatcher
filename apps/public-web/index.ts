import { telemetry } from './src/instrumentation.js';
// eslint-disable-next-line sort-imports
import {
  errorLogMiddleware,
  logMiddleware,
  logger,
  requestIdMiddleware,
} from '@sektek/common';
import bodyParser from 'body-parser';
import express from 'express';
import { app as publicApp } from './src/app.js';

telemetry.start();

const app = express();
const port = process.env.PORT || 3000;
app.use(requestIdMiddleware);
app.use(bodyParser.json());
app.use(logMiddleware);

app.use('/', publicApp);
app.use(errorLogMiddleware);

app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});
