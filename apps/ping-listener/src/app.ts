import {
  AmqpDispatcher,
  AmqpGateway,
  PingRequestEvent,
  PingResponseEvent,
  SimpleProcessor,
  pingRequestHandler,
} from '@sektek/common';

const amqpDispatcher = await AmqpDispatcher.from({
  url: 'amqp://dispatcher-mq:5672',
  queue: 'ping-response',
});

const processor = new SimpleProcessor<PingRequestEvent, PingResponseEvent>({
  handler: pingRequestHandler,
  responseHandler: amqpDispatcher,
});

export const amqpGateway = await AmqpGateway.from({
  url: 'amqp://dispatcher-mq:5672',
  queue: 'ping-request',
  handler: processor,
});
