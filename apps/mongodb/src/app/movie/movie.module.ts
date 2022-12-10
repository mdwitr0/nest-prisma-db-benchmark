import { Module } from '@nestjs/common';

import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { PrismaMongodbModule } from '@prisma/mongodb';
import { ApiClientModule } from '@kinopoiskdev-client';
import { MovieAdapter } from '@adapters';
import { MovieProcessor } from './movie.prosessor';
import { BullModule } from '@nestjs/bull';
import { QueueEnum } from '@enum';

@Module({
  imports: [
    PrismaMongodbModule,
    ApiClientModule.register({
      apiKey: process.env.API_KEY,
      baseURL: 'https://api.kinopoisk.dev',
    }),
    BullModule.registerQueue({
      name: QueueEnum.MOVIE,
      defaultJobOptions: { removeOnComplete: true, removeOnFail: 2 },
      limiter: { max: 10, duration: 1000 },
    }),
  ],
  controllers: [MovieController],
  providers: [MovieService, MovieAdapter, MovieProcessor],
})
export class MovieModule {}
