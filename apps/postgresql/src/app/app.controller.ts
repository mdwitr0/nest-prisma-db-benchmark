import { Controller, Get } from '@nestjs/common';

import { MovieAdapter } from '@adapters';
import { PrismaPostgresqlService } from '@prisma/postgresql';
import { AppService } from './app.service';
import { Span } from 'nestjs-otel';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaPostgresqlService,
    private readonly movieClient: MovieAdapter
  ) {}

  @Span()
  @Get('metrics')
  async metrics() {
    return this.prisma.$metrics.prometheus({
      globalLabels: { app: 'postgresql' },
    });
  }
}
