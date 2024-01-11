import { logger, morganMiddleware } from '@sektek/common';
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;
app.use(morganMiddleware);

app.get('/', async (req, res) => {
  res.send('Hello World!');
});

const server = app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});
server.on('error', logger.error);
