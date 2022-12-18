import Pino, { Logger } from 'pino';
import { LoggerOptions, destination } from 'pino';
import { trace, context } from '@opentelemetry/api';
import * as prettier from 'pino-pretty';

export const loggerOptions: LoggerOptions = {
  level: 'info',
  formatters: {
    level(label) {
      return { level: label };
    },
    log(object) {
      const span = trace.getSpan(context.active());
      if (!span) return { ...object };
      const { spanId, traceId } = span.spanContext();
      return { ...object, spanId, traceId };
    },
  },
  prettifier: process.env.NODE_ENV === 'local' ? prettier : false,
};

export const logger: Logger = Pino(
  loggerOptions,
  destination(process.env.LOG_FILE_NAME)
);
