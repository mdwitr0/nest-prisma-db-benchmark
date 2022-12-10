import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaMongodbModule } from '@prisma/mongodb';
import { MovieAdapter, PersonAdapter } from '@adapters';
import { MovieModule } from './movie/movie.module';
import { PersonModule } from './person/person.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    PrismaMongodbModule,
    MovieModule,
    PersonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
