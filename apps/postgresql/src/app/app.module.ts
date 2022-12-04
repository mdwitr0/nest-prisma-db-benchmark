import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaPostgresqlModule } from '@prisma/postgresql';
import { ApiClientModule } from '@kinopoiskdev-client';

@Module({
  imports: [
    PrismaPostgresqlModule,
    ApiClientModule.register({
      apiKey: process.env.API_KEY,
      baseURL: 'https://api.kinopoisk.dev',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
