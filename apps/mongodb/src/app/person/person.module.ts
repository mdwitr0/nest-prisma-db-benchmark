import { Module } from '@nestjs/common';

import { PersonController } from './person.controller';
import { PersonService } from './person.service';
import { PrismaMongodbModule } from '@prisma/mongodb';
import { ApiClientModule } from '@kinopoiskdev-client';
import { PersonAdapter } from '@adapters';

@Module({
  imports: [
    PrismaMongodbModule,
    ApiClientModule.register({
      apiKey: process.env.API_KEY,
      baseURL: 'https://api.kinopoisk.dev',
    }),
  ],
  controllers: [PersonController],
  providers: [PersonService, PersonAdapter],
})
export class PersonModule {}
