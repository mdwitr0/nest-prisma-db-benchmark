import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { AppService } from './app.service';
import { Movie, Prisma, PrismaMongodbService } from '@prisma/mongodb';
import {
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
import { MovieAdapter, PersonAdapter } from '@adapters';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaMongodbService,
    private readonly movieClient: MovieAdapter,
    private readonly personClient: PersonAdapter
  ) {}

  @Get('metrics')
  async metrics() {
    return this.prisma.$metrics.prometheus({
      globalLabels: { app: 'mongodb' },
    });
  }

  @Get('movie/update')
  upsertMovie(@Query(TransformPipe) pagination: CreatePaginationQueryDto): {
    message: string;
  } {
    const { limit, page, end } = pagination;
    const range$ = range(page, end);

    range$.subscribe((page) => {
      const movies$ = this.movieClient.findManyFromKp({ limit, page }).pipe(
        map((res) => res.docs),
        switchAll(),
        mergeMap((movie) => this.appService.upsertMovie(movie))
      );

      movies$.subscribe();
    });
    return { message: 'ok' };
  }

  @Get('persons/upsert')
  upsertPersons(@Query(TransformPipe) pagination: CreatePaginationQueryDto): {
    message: string;
  } {
    const { limit, page, end } = pagination;
    const range$ = range(page, end);

    range$.subscribe((page) => {
      const movies$ = this.personClient.findManyFromKp({ limit, page }).pipe(
        map((res) => res.docs),
        switchAll(),
        mergeMap((person) => this.appService.upsertPerson(person))
      );

      movies$.subscribe();
    });
    return { message: 'ok' };
  }

  @Get('find/:id')
  findMovieById(@Param('id', ParseIntPipe) id: number): Promise<Movie> {
    return this.appService.findUniqueMovie({ kpId: id });
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
    return this.appService.findManyMovie(pagination, query);
  }
}
