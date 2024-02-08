import { logger, morganMiddleware, requestIdMiddleware } from '@sektek/common';
import { app as dispatcherApp } from './src/app.js';
import bodyParser from 'body-parser';
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(requestIdMiddleware);
app.use(morganMiddleware);

app.use('/', dispatcherApp);

const server = app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});
server.on('error', logger.error);
