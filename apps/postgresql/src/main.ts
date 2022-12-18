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
  await initTracing('potgresql', 8081);

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  await app.listen(3112);

  logger.log(
    '🔥 Postgresql application is running on: ' + (await app.getUrl())
  );
}
bootstrap();
