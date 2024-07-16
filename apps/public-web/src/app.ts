import {
  EventRelayProcessor,
  EventRouter,
  HttpDispatcher,
  HttpGateway,
  HttpProcessor,
  pingRequestHandler,
} from '@sektek/common';
import { Router as ExpressRouter } from 'express';

export const app = ExpressRouter();

const eventRelayProcessor = new EventRelayProcessor({
  handler: new HttpDispatcher({ url: 'http://dispatcher:3000/' }),
});

const router = new EventRouter({
  name: 'EventRelayRouter',
  routeProvider: eventRelayProcessor,
});

const httpProcessor = new HttpProcessor({
  handler: eventRelayProcessor,
});
const httpResponseGateway = new HttpGateway({ handler: router });

const httpPingProcessor = new HttpProcessor({
  handler: pingRequestHandler,
});

app.post('/', httpProcessor.requestHandler);
app.post('/dispatch', httpResponseGateway.requestHandler);
app.post('/ping', httpPingProcessor.requestHandler);
