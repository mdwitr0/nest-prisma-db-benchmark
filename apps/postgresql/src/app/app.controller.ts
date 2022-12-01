import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { PrismaPostgresqlService } from '@prisma/postgresql';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaPostgresqlService
  ) {}

  @Get('metrics')
  async metrics() {
    return this.prisma.$metrics.prometheus();
  }
}
