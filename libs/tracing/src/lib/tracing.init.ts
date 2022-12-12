import { Logger } from '@nestjs/common';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { CompositePropagator } from '@opentelemetry/core';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { B3InjectEncoding, B3Propagator } from '@opentelemetry/propagator-b3';
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';
import { Resource } from '@opentelemetry/resources';
import * as opentelemetry from '@opentelemetry/sdk-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import * as process from 'process';

export const initTracing = async (serviceName: string): Promise<void> => {
  const logger = new Logger('Tracing');
  const traceExporter = new JaegerExporter();

  const spanProcessor = new SimpleSpanProcessor(traceExporter);

  const sdk = new opentelemetry.NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
    contextManager: new AsyncLocalStorageContextManager(),
    textMapPropagator: new CompositePropagator({
      propagators: [
        new JaegerPropagator(),
        new B3Propagator(),
        new B3Propagator({
          injectEncoding: B3InjectEncoding.MULTI_HEADER,
        }),
      ],
    }),
    instrumentations: [
      getNodeAutoInstrumentations(),
      new HttpInstrumentation(),
      new PrismaInstrumentation(),
    ],
    // Using a simple span processor for faster response.
    // You can also use the batch processor instead.
    spanProcessor,
  });

  try {
    await sdk.start();
    logger.log('Tracing initialized');
  } catch (error) {
    logger.log('Error initializing tracing', error);
  }

  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(() => logger.log('Tracing terminated'))
      .catch((error) => logger.log('Error terminating tracing', error))
      .finally(() => process.exit(0));
  });
};
