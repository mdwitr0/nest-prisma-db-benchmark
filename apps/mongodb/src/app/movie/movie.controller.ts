import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import {
  CreatePaginationQueryDto,
  PaginationQueryDto,
  PaginationResponseDto,
  SearchAllQueryDto,
} from '@dto';
import { QueueEnum, QueueProcess } from '@enum';
import { InjectQueue } from '@nestjs/bull';
import { TransformPipe } from '@pipes';
import { Movie, Prisma } from '@prisma/mongodb';
import { Queue } from 'bull';
import { Observable, range } from 'rxjs';
import { MovieService } from './movie.service';

@Controller('movie')
export class MovieController {
  constructor(
    private readonly service: MovieService,
    @InjectQueue(QueueEnum.MONGO_MOVIE) private readonly queue: Queue
  ) {}

  @Get('upsert')
  upsert(@Query(TransformPipe) pagination: CreatePaginationQueryDto): {
    message: string;
  } {
    const { limit, page, end } = pagination;
    range(page, end).subscribe((page) => {
      this.queue.add(QueueProcess.MONGO_PARSE_PAGE, { page, limit });
    });
    return { message: 'ok' };
  }

  @Get('find/:id')
  findMovieById(@Param('id', ParseIntPipe) id: number): Promise<Movie> {
    return this.service.findUnique({ kpId: id });
  }

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
