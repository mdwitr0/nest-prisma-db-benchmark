import { Module } from '@nestjs/common';

import { PersonAdapter } from '@adapters';
import { QueueEnum } from '@enum';
import { ApiClientModule } from '@kinopoiskdev-client';
import { BullModule } from '@nestjs/bull';
import { PersonController } from './person.controller';
import { PersonProcessor } from './person.prosessor';
import { PersonService } from './person.service';

@Module({
  imports: [
    ApiClientModule.register({
      apiKey: process.env.API_KEY,
      baseURL: 'https://api.kinopoisk.dev',
    }),
    BullModule.registerQueue({
      name: QueueEnum.PERSON,
      defaultJobOptions: { removeOnComplete: true, removeOnFail: 2 },
      limiter: { max: 500, duration: 1000 },
    }),
  ],
  controllers: [PersonController],
  providers: [PersonService, PersonAdapter, PersonProcessor],
})
export class PersonModule {}
