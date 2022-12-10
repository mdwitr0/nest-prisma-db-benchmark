import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaMongodbModule } from '@prisma/mongodb';
import { MovieAdapter, PersonAdapter } from '@adapters';
import { MovieModule } from './movie/movie.module';
import { PersonModule } from './person/person.module';

@Module({
  imports: [PrismaMongodbModule, MovieModule, PersonModule],
  controllers: [AppController],
  providers: [AppService, MovieAdapter, PersonAdapter],
})
export class AppModule {}
