import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app/app.module';
import { Logger } from '@nestjs/common';
import { initTracing } from '@tracing';
import { Logger as PinoLogger } from 'nestjs-pino';
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  await initTracing('mongodb', 8082);

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  app.useLogger(app.get(PinoLogger));

  app.enableShutdownHooks();
  await app.listen(3111);

  logger.log('🔥 Mongodb application is running on: ' + (await app.getUrl()));
}
bootstrap();
