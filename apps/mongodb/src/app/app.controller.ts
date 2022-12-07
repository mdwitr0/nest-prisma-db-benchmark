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
import { MovieAdapter } from '@adapters';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaMongodbService,
    private readonly movieClient: MovieAdapter
  ) {}

  @Get('metrics')
  async metrics() {
    return this.prisma.$metrics.prometheus({
      globalLabels: { app: 'mongodb' },
    });
  }

  @Get('create-or-update/:id(\\d+)')
  createOrUpdate(@Param('id', ParseIntPipe) id: number): Observable<Movie> {
    return this.movieClient.findByIdFromKp(id).pipe(
      tap((movie) => console.log('movie: ', movie.kpId)),
      map((movie) => {
        const persons$ = from(movie.persons).pipe(
          tap((person) => console.log('person: ', person.kpId)),
          mergeMap((person) => this.appService.upsertPerson(person))
        );
        persons$.subscribe();
        return movie;
      }),
      mergeMap((movie) => this.appService.upsertMovie(movie)),
      catchError((err) => {
        console.log(err);
        return of(null);
      })
    );
  }

  @Get('create-or-update/all')
  createOrUpdateAll(
    @Query(TransformPipe) pagination: CreatePaginationQueryDto
  ): { message: string } {
    const { limit, page, end } = pagination;
    const range$ = range(page, end);

    range$.subscribe((page) => {
      const movies$ = this.movieClient.findManyFromKp({ limit, page }).pipe(
        map((movies) => movies.docs),
        switchAll(),
        tap((movie) => console.log('movie: ', movie.kpId)),
        map((movie) => {
          const persons$ = from(movie.persons).pipe(
            tap((person) => console.log('person: ', person.kpId)),
            mergeMap((person) => this.appService.upsertPerson(person))
          );
          persons$.subscribe();
          return movie;
        }),
        mergeMap((movie) => this.appService.upsertMovie(movie))
      );

      movies$.subscribe();
    });
    return { message: 'ok' };
  }

  @Get('find/:id')
  findById(@Param('id', ParseIntPipe) id: number): Promise<Movie> {
    return this.appService.findUnique({ kpId: id });
  }

  @Get('find/all')
  findMany(
    @Query(TransformPipe) pagination: PaginationQueryDto,
    @Query(TransformPipe)
    query: SearchAllQueryDto<
      Prisma.MovieWhereInput,
      Prisma.Enumerable<Prisma.MovieOrderByWithRelationInput>
    >
  ): Observable<PaginationResponseDto<Movie>> {
    return this.appService.findMany(pagination, query);
  }
}
