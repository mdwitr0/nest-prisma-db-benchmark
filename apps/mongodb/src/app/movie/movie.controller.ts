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

@Controller('movie')
export class MovieController {
  constructor(
    private readonly service: MovieService,
    private readonly prisma: PrismaMongodbService,
    private readonly movieClient: MovieAdapter
  ) {}

  @Get('upsert')
  upsert(@Query(TransformPipe) pagination: CreatePaginationQueryDto): {
    message: string;
  } {
    const { limit, page, end } = pagination;
    const range$ = range(page, end);

    range$.subscribe((page) => {
      const movies$ = this.movieClient.findManyFromKp({ limit, page }).pipe(
        map((res) => res.docs),
        switchAll(),
        mergeMap((movie) => this.service.upsert(movie))
      );

      movies$.subscribe();
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
