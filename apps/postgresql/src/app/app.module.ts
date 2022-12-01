import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaPostgresqlModule } from '@prisma/postgresql';

@Module({
  imports: [PrismaPostgresqlModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
