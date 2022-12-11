import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app/app.module';
import { Logger } from '@nestjs/common';
import { initTracing } from '@tracing';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  await initTracing('mongodb');

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  await app.listen(3111);

  logger.log('🔥 Mongodb application is running on: ' + (await app.getUrl()));
}
bootstrap();
