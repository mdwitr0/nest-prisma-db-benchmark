import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaPostgresqlModule } from '@prisma/postgresql';
import { ApiClientModule } from '@kinopoiskdev-client';
import { MovieAdapter } from '@adapters';

@Module({
  imports: [
    PrismaPostgresqlModule,
    ApiClientModule.register({
      apiKey: process.env.API_KEY,
      baseURL: 'https://api.kinopoisk.dev',
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: MovieAdapter,
      useClass: MovieAdapter,
    },
  ],
})
export class AppModule {}
