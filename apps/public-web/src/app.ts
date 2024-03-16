import {
  EventRelayProcessor,
  HttpDispatcher,
  HttpGateway,
  HttpProcessor,
  SingleUseRouter,
} from '@sektek/common';
import { Router as ExpressRouter } from 'express';

export const app = ExpressRouter();

const router = new SingleUseRouter({
  name: 'EventRelayRouter',
  routeDecider: async event => event.id,
});

const eventRelayProcessor = new EventRelayProcessor({
  handler: new HttpDispatcher({ url: 'http://dispatcher:3000/' }),
  router,
});

const httpProcessor = new HttpProcessor({
  handler: eventRelayProcessor,
});
const httpResponseGateway = new HttpGateway({ handler: router });

app.post('/', httpProcessor.requestHandler);
app.post('/dispatch', httpResponseGateway.requestHandler);