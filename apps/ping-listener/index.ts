import { logger, morganMiddleware } from '@sektek/common';
import { amqpGateway } from './src/app.js';
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;
app.use(morganMiddleware);

app.get('/', async (req, res) => {
  res.send('Hello World!');
});

amqpGateway.start();

const server = app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});
server.on('error', logger.error);
