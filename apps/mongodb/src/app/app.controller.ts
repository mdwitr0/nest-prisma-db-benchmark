import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { PrismaMongodbService } from '@prisma/mongodb';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaMongodbService
  ) {}

  @Get('metrics')
  async metrics() {
    return this.prisma.$metrics.prometheus({
      globalLabels: { app: 'mongodb' },
    });
  }
}
