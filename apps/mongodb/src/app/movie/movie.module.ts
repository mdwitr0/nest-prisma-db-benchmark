import { Module } from '@nestjs/common';

import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { PrismaMongodbModule } from '@prisma/mongodb';
import { ApiClientModule } from '@kinopoiskdev-client';
import { MovieAdapter } from '@adapters';

@Module({
  imports: [
    PrismaMongodbModule,
    ApiClientModule.register({
      apiKey: process.env.API_KEY,
      baseURL: 'https://api.kinopoisk.dev',
    }),
  ],
  controllers: [MovieController],
  providers: [MovieService, MovieAdapter],
})
export class MovieModule {}
