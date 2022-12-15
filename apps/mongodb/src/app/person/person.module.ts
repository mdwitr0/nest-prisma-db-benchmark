import { Module } from '@nestjs/common';

import { PersonController } from './person.controller';
import { PersonService } from './person.service';
import {
  mongodbLoggingMiddleware,
  mongodbRetryMiddleware,
  PrismaMongodbModule,
} from '@prisma/mongodb';
import { ApiClientModule } from '@kinopoiskdev-client';
import { PersonAdapter } from '@adapters';
import { BullModule } from '@nestjs/bull';
import { QueueEnum } from '@enum';
import { PersonProcessor } from './person.prosessor';
import { OpenTelemetryModule } from 'nestjs-otel';

@Module({
  imports: [
    PrismaMongodbModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        prismaOptions: {
          log: ['warn', 'error'],
        },
        middlewares: [mongodbLoggingMiddleware()],
      },
    }),
    ApiClientModule.register({
      apiKey: process.env.API_KEY,
      baseURL: 'https://api.kinopoisk.dev',
    }),
    BullModule.registerQueue({
      name: QueueEnum.MONGO_PERSON,
      defaultJobOptions: { removeOnComplete: true, removeOnFail: 2 },
      limiter: { max: 1, duration: 1000 },
    }),
    OpenTelemetryModule.forRoot({
      metrics: {
        hostMetrics: true,
        apiMetrics: {
          enable: true,
        },
      },
    }),
  ],
  controllers: [PersonController],
  providers: [PersonService, PersonAdapter, PersonProcessor],
})
export class PersonModule { }
