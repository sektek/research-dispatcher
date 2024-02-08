import { logger, morganMiddleware, requestIdMiddleware } from '@sektek/common';
import bodyParser from 'body-parser';
import express from 'express';
import { app as publicApp } from './src/app.js';

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(requestIdMiddleware);
app.use(morganMiddleware);

app.use('/', publicApp);

const server = app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});
server.on('error', logger.error);
