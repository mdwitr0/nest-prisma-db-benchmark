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

@Module({
  imports: [
    PrismaMongodbModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        prismaOptions: {
          log: ['info', 'warn', 'error'],
        },
        middlewares: [mongodbLoggingMiddleware(), mongodbRetryMiddleware()],
      },
    }),
    ApiClientModule.register({
      apiKey: process.env.API_KEY,
      baseURL: 'https://api.kinopoisk.dev',
    }),
    BullModule.registerQueue({
      name: QueueEnum.MONGO_PERSON,
      defaultJobOptions: { removeOnComplete: true, removeOnFail: 2 },
      limiter: { max: 500, duration: 1000 },
    }),
  ],
  controllers: [PersonController],
  providers: [PersonService, PersonAdapter, PersonProcessor],
})
export class PersonModule {}
