import {
  AmqpDispatcher,
  AmqpGateway,
  EventRouter,
  HttpGateway,
  HttpResponseRouteProvider,
} from '@sektek/common';
import { Router as ExpressRouter } from 'express';

export const app = ExpressRouter();

const amqpDispatcher = await AmqpDispatcher.from({
  url: 'amqp://dispatcher-mq:5672',
  queue: 'ping-request',
});

const httpGateway = new HttpGateway({
  handler: amqpDispatcher,
});

const routeProvider = new HttpResponseRouteProvider({ httpGateway });
const httpDispatcher = new EventRouter({ routeProvider });

const amqpGateway = await AmqpGateway.from({
  url: 'amqp://dispatcher-mq:5672',
  queue: 'ping-response',
  handler: httpDispatcher,
});

amqpGateway.start();
app.post('/', httpGateway.requestHandler);
