import { AmqpDispatcher, AmqpGateway, Event, PingRequestEvent, PingResponseEvent, SimpleProcessor } from '@sektek/common';

const amqpDispatcher = await AmqpDispatcher.from({
  url: 'amqp://dispatcher-mq:5672',
  queue: 'ping-response',
});

const processor = new SimpleProcessor<PingRequestEvent, PingResponseEvent>({
  handler: async event => {
    return {
      ...event,
      type: 'PingResponse',
      data: {
        ...(event.data ?? {}),
        receivedAt: new Date().getTime(),
      },
    };
  },
  responseHandler: amqpDispatcher,
});

export const amqpGateway = await AmqpGateway.from({
  url: 'amqp://dispatcher-mq:5672',
  queue: 'ping-request',
  handler: processor,
});
