import { Module } from '@nestjs/common';

import { MovieAdapter } from '@adapters';
import { QueueEnum } from '@enum';
import { ApiClientModule } from '@kinopoiskdev-client';
import { BullModule } from '@nestjs/bull';
import {
  PrismaPostgresqlModule,
  postgresqlLoggingMiddleware,
} from '@prisma/postgresql';
import { MovieController } from './movie.controller';
import { MovieProcessor } from './movie.prosessor';
import { MovieService } from './movie.service';

@Module({
  imports: [
    PrismaPostgresqlModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        prismaOptions: {
          log: ['warn', 'error'],
        },
        middlewares: [postgresqlLoggingMiddleware()],
      },
    }),
    ApiClientModule.register({
      apiKey: process.env.API_KEY,
      baseURL: 'https://api.kinopoisk.dev',
    }),
    BullModule.registerQueue({
      name: QueueEnum.POSTGRES_MOVIE,
      defaultJobOptions: { removeOnComplete: true, removeOnFail: 2 },
      limiter: { max: 1, duration: 1000 },
    }),
  ],
  controllers: [MovieController],
  providers: [MovieService, MovieAdapter, MovieProcessor],
})
export class MovieModule {}
