import { Module } from '@nestjs/common';

import { PersonAdapter } from '@adapters';
import { QueueEnum } from '@enum';
import { ApiClientModule } from '@kinopoiskdev-client';
import { BullModule } from '@nestjs/bull';
import {
  PrismaPostgresqlModule,
  postgresqlLoggingMiddleware,
} from '@prisma/postgresql';
import { PersonController } from './person.controller';
import { PersonProcessor } from './person.prosessor';
import { PersonService } from './person.service';

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
      name: QueueEnum.POSTGRES_PERSON,
      defaultJobOptions: { removeOnComplete: true, removeOnFail: 2, lifo: true },
      limiter: { max: 1, duration: 1000,  },
    }),
  ],
  controllers: [PersonController],
  providers: [PersonService, PersonAdapter, PersonProcessor],
})
export class PersonModule {}
