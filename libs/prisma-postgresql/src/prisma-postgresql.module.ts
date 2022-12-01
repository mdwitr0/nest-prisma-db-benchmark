import { Module } from '@nestjs/common';
import { PrismaPostgresqlService } from './prisma-postgresql.service';

@Module({
  controllers: [],
  providers: [PrismaPostgresqlService],
  exports: [PrismaPostgresqlService],
})
export class PrismaPostgresqlModule {}
