import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { AppService } from './app.service';
import { Movie, Prisma, PrismaPostgresqlService } from '@prisma/postgresql';
import {
  auditTime,
  catchError,
  from,
  map,
  mergeMap,
  Observable,
  of,
  range,
  switchAll,
  tap,
} from 'rxjs';
import {
  CreatePaginationQueryDto,
  PaginationQueryDto,
  PaginationResponseDto,
  SearchAllQueryDto,
} from '@dto';
import { TransformPipe } from '@pipes';
import { MovieAdapter } from '@adapters';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaPostgresqlService,
    private readonly movieClient: MovieAdapter
  ) {}

  @Get('metrics')
  async metrics() {
    return this.prisma.$metrics.prometheus({
      globalLabels: { app: 'postgresql' },
    });
  }
}
