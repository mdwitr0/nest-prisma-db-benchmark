import { Module } from '@nestjs/common';
import { PrismaMongodbService } from './prisma-mongodb.service';

@Module({
  controllers: [],
  providers: [PrismaMongodbService],
  exports: [PrismaMongodbService],
})
export class PrismaMongodbModule {}
