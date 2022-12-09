import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaMongodbModule } from '@prisma/mongodb';
import { ApiClientModule } from '@kinopoiskdev-client';
import { MovieAdapter, PersonAdapter } from '@adapters';

@Module({
  imports: [
    PrismaMongodbModule,
    ApiClientModule.register({
      apiKey: process.env.API_KEY,
      baseURL: 'https://api.kinopoisk.dev',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, MovieAdapter, PersonAdapter],
})
export class AppModule {}
