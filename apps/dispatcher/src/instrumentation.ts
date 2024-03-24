import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { AmqplibInstrumentation } from '@opentelemetry/instrumentation-amqplib';
// import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
// import { registerInstrumentations } from '@opentelemetry/instrumentation';

const traceExporter = new OTLPTraceExporter({
  url: 'http://agent:4318/v1/traces',
});
const exporter = new OTLPMetricExporter({
  url: 'http://agent:4318/v1/metrics',
});
// const traceExporter = new ConsoleSpanExporter();
// const exporter = new ConsoleMetricExporter();

export const telemetry = new NodeSDK({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: 'dispatcher',
    [SEMRESATTRS_SERVICE_VERSION]: '0.1.0',
  }),
  traceExporter,
  metricReader: new PeriodicExportingMetricReader({
    exporter,
    exportIntervalMillis: 1000,
  }),
  instrumentations: [
    getNodeAutoInstrumentations(),
    new AmqplibInstrumentation(),
    new FetchInstrumentation(),
    new HttpInstrumentation(),
    new WinstonInstrumentation(),
  ],
});
