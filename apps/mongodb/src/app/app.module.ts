import { Module } from '@nestjs/common';

import { BullModule } from '@nestjs/bull';
import { PrismaMongodbModule } from '@prisma/mongodb';
import { OpenTelemetryModule } from 'nestjs-otel';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MovieModule } from './movie/movie.module';
import { PersonModule } from './person/person.module';
import { LoggerModule } from '@logger';
@Module({
  imports: [
    PrismaMongodbModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    MovieModule,
    PersonModule,
    OpenTelemetryModule.forRoot({
      metrics: {
        hostMetrics: true,
        apiMetrics: {
          enable: true,
        },
      },
    }),
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
