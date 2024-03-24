import {
  errorLogMiddleware,
  logMiddleware,
  logger,
  requestIdMiddleware,
} from '@sektek/common';
import LokiTransport from 'winston-loki';
import { amqpGateway } from './src/app.js';
import bodyParser from 'body-parser';
import express from 'express';
import { format } from 'winston';
import { telemetry } from './src/instrumentation.js';
import { traceMiddleware } from './src/trace-middleware.js';

logger.add(
  new LokiTransport({
    host: 'http://loki:3100',
    format: format.json(),
    labels: { app: 'ping-listener' },
  }),
);

telemetry.start();

const app = express();
const port = process.env.PORT || 3000;
app.use(requestIdMiddleware);
app.use(traceMiddleware);
app.use(bodyParser.json());
app.use(logMiddleware);

app.get('/', async (req, res) => {
  res.send('Hello World!');
});
app.use(errorLogMiddleware);

amqpGateway.start();

const server = app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});
server.on('error', logger.error);
