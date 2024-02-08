import {
  AmqpDispatcher,
  AmqpGateway,
  HttpDispatcher,
  HttpGateway,
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

const httpDispatcher = new HttpDispatcher({ url: 'http://public-web:3000/dispatch' });

const amqpGateway = await AmqpGateway.from({
  url: 'amqp://dispatcher-mq:5672',
  queue: 'ping-response',
  handler: httpDispatcher,
});

amqpGateway.start();
app.post('/', httpGateway.requestHandler);
