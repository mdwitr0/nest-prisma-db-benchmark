import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaPostgresqlModule } from '@prisma/postgresql';
import { ApiClientModule } from '@kinopoiskdev-client';
import { MovieAdapter } from '@adapters';
import { BullModule } from '@nestjs/bull';
import { MovieModule } from './movie/movie.module';
import { PersonModule } from './person/person.module';

@Module({
  imports: [
    PrismaPostgresqlModule,
    ApiClientModule.register({
      apiKey: process.env.API_KEY,
      baseURL: 'https://api.kinopoisk.dev',
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    MovieModule,
    PersonModule,
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
