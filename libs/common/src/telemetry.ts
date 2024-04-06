import {
  BasicTracerProvider,
  NodeTracerProvider,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-node';
import { DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api';
import {
  InstrumentationBase,
  registerInstrumentations,
} from '@opentelemetry/instrumentation';
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { AmqplibInstrumentation } from '@opentelemetry/instrumentation-amqplib';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { OTLPExporterNodeConfigBase } from '@opentelemetry/otlp-exporter-base';
// import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import { env } from 'process';

const DEFAULT_VERSION = '0.1.0';
const HTTP_REQUEST_IGNORE_PORTS = [3100, 4318];

type TelemetryConfig = {
  serviceName?: string;
  serviceVersion?: string;
  instrumentations?: unknown[];
  traceExporterConfig?: OTLPExporterNodeConfigBase;
  debug?: boolean;
};

const DEFAULT_CONFIG = {
  serviceName: env.SERVICE_NAME ?? 'unknown',
  serviceVersion: DEFAULT_VERSION,
  traceExporterConfig: {
    url: env.OLTP_TRACE_EXPORTER_URL ?? 'http://localhost:4318/v1/traces',
  },
  instrumentations: [
    new AmqplibInstrumentation(),
    new HttpInstrumentation({
      ignoreOutgoingRequestHook: req =>
        HTTP_REQUEST_IGNORE_PORTS.includes(Number(req.port)),
    }),
    new ExpressInstrumentation(),
    new WinstonInstrumentation(),
    new UndiciInstrumentation(),
  ],
  debug: false,
};

export class Telemetry {
  #tracerProvider: BasicTracerProvider;
  #instrumentations: unknown;

  constructor(config: TelemetryConfig = {}) {
    config = { ...DEFAULT_CONFIG, ...config };
    if (config.debug) {
      diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
    }
    this.#instrumentations = config.instrumentations || [];
    const traceExporter = new OTLPTraceExporter(config.traceExporterConfig);

    const resource = new Resource({
      [SEMRESATTRS_SERVICE_NAME]: config.serviceName,
      [SEMRESATTRS_SERVICE_VERSION]: config.serviceVersion,
    });

    this.#tracerProvider = new NodeTracerProvider({ resource });
    this.#tracerProvider.addSpanProcessor(
      new SimpleSpanProcessor(traceExporter),
    );
  }

  start() {
    this.#tracerProvider.register();
    registerInstrumentations({
      tracerProvider: this.#tracerProvider,
      instrumentations: this.#instrumentations as InstrumentationBase[],
    });
  }
}
