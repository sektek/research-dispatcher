import { NextFunction, Response } from 'express';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Request } from '@sektek/common';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { trace } from '@opentelemetry/api';

const provider = new NodeTracerProvider();
provider.register();

registerInstrumentations({
  instrumentations: [
    new WinstonInstrumentation({
      logHook: (span, record) => {
        record['resource.service.name'] =
          provider.resource.attributes['service.name'];
      },
    }),
  ],
});

const exporter = new OTLPTraceExporter({ url: 'http://agent:4317' });
provider.addSpanProcessor(
  new BatchSpanProcessor(exporter, {
    maxQueueSize: 100,
    maxExportBatchSize: 10,
    scheduledDelayMillis: 500,
    exportTimeoutMillis: 10000,
  }),
);
trace.setGlobalTracerProvider(provider);

const name = 'public-web';
const version = '0.1.0';
const tracer = trace.getTracer(name, version);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const traceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const span = tracer.startSpan(req.path);
  res.on('finish', () => span.end());
  next();
};
