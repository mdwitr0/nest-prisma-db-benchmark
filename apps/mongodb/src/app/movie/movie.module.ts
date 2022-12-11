import { Module } from '@nestjs/common';

import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import {
  mongodbLoggingMiddleware,
  mongodbRetryMiddleware,
  PrismaMongodbModule,
} from '@prisma/mongodb';
import { ApiClientModule } from '@kinopoiskdev-client';
import { MovieAdapter } from '@adapters';
import { MovieProcessor } from './movie.prosessor';
import { BullModule } from '@nestjs/bull';
import { QueueEnum } from '@enum';
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
      name: QueueEnum.MONGO_MOVIE,
      defaultJobOptions: { removeOnComplete: true, removeOnFail: 2 },
      limiter: { max: 500, duration: 1000 },
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
  controllers: [MovieController],
  providers: [MovieService, MovieAdapter, MovieProcessor],
})
export class MovieModule {}
