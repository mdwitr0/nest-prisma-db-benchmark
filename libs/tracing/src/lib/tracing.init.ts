import { Logger } from '@nestjs/common';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { Resource } from '@opentelemetry/resources';
import * as opentelemetry from '@opentelemetry/sdk-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import * as process from 'process';

export const initTracing = async (
  serviceName: string,
  metricsPort: number
): Promise<void> => {
  const logger = new Logger('Tracing');

  const sdk = new opentelemetry.NodeSDK({
    metricReader: new PrometheusExporter({
      port: metricsPort,
    }),
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
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
