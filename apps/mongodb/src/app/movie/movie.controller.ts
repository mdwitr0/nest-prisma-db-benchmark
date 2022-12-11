import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { MovieService } from './movie.service';
import { Movie, Prisma, PrismaMongodbService } from '@prisma/mongodb';
import { map, mergeMap, Observable, range, switchAll } from 'rxjs';
import {
  CreatePaginationQueryDto,
  PaginationQueryDto,
  PaginationResponseDto,
  SearchAllQueryDto,
} from '@dto';
import { TransformPipe } from '@pipes';
import { MovieAdapter } from '@adapters';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { QueueEnum, QueueProcess } from '@enum';
import { OtelMethodCounter, Span, TraceService } from 'nestjs-otel';

@Controller('movie')
export class MovieController {
  constructor(
    private readonly service: MovieService,
    private readonly prisma: PrismaMongodbService,
    private readonly movieClient: MovieAdapter,
    @InjectQueue(QueueEnum.MONGO_MOVIE) private readonly queue: Queue,
    private readonly traceService: TraceService
  ) {}

  @Span()
  @Get('upsert')
  upsert(@Query(TransformPipe) pagination: CreatePaginationQueryDto): {
    message: string;
  } {
    const { limit, page, end } = pagination;
    range(page, end).subscribe((page) => {
      this.queue.add(
        QueueProcess.MONGO_PARSE_PAGE,
        { page, limit },
        { delay: 1000 * (page - 1) }
      );
    });
    return { message: 'ok' };
  }

  @Span()
  @Get('find/:id')
  findMovieById(@Param('id', ParseIntPipe) id: number): Promise<Movie> {
    return this.service.findUnique({ kpId: id });
  }

  @Span()
  @Get('find/all')
  findManyMovie(
    @Query(TransformPipe) pagination: PaginationQueryDto,
    @Query(TransformPipe)
    query: SearchAllQueryDto<
      Prisma.MovieWhereInput,
      Prisma.Enumerable<Prisma.MovieOrderByWithRelationInput>
    >
  ): Observable<PaginationResponseDto<Movie>> {
    return this.service.findMany(pagination, query);
  }
}
