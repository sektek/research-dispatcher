import {
  errorLogMiddleware,
  logMiddleware,
  logger,
  requestIdMiddleware,
} from '@sektek/common';
import LokiTransport from 'winston-loki';
import bodyParser from 'body-parser';
import { app as dispatcherApp } from './src/app.js';
import express from 'express';
import { format } from 'winston';
import { telemetry } from './src/instrumentation.js';
import { traceMiddleware } from './src/trace-middleware.js';

logger.add(
  new LokiTransport({
    host: 'http://loki:3100',
    format: format.json(),
    labels: { service_name: 'dispatcher' },
  }),
);

telemetry.start();

const app = express();
const port = process.env.PORT || 3000;
app.use(requestIdMiddleware);
app.use(traceMiddleware);
app.use(bodyParser.json());
app.use(logMiddleware);

app.use('/', dispatcherApp);
app.use(errorLogMiddleware);

const server = app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});
server.on('error', logger.error);
