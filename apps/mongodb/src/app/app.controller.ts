import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { AppService } from './app.service';
import { Movie, Prisma, PrismaMongodbService } from '@prisma/mongodb';
import { ApiClientService } from '@kinopoiskdev-client';
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
  KpToMovieDto,
  PaginationQueryDto,
  PaginationResponseDto,
  SearchAllQueryDto,
} from '@dto';
import { plainToInstance } from 'class-transformer';
import { TransformPipe } from '@pipes';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaMongodbService,
    private readonly api: ApiClientService
  ) {}

  @Get('metrics')
  async metrics() {
    return this.prisma.$metrics.prometheus({
      globalLabels: { app: 'mongodb' },
    });
  }

  @Get('create-or-update/:id(\\d+)')
  createOrUpdate(@Param('id', ParseIntPipe) id: number): Observable<Movie> {
    return this.api.findMovieById({ id }).pipe(
      map((movie) =>
        plainToInstance(KpToMovieDto, movie, {
          excludeExtraneousValues: true,
        })
      ),
      tap((movie) => console.log('movie: ', movie.kpId)),
      map((movie) => {
        const persons$ = from(movie.persons).pipe(
          tap((person) => console.log('person: ', person.kpId)),

          mergeMap((person) => {
            const { description, ...p } = person;

            return this.prisma.person.upsert({
              where: { kpId: person.kpId },
              create: {
                ...p,
              },
              update: {
                ...p,
              },
            });
          })
        );
        persons$.subscribe();
        return movie;
      }),
      mergeMap((movie) => {
        const data: Prisma.MovieCreateInput = {
          ...movie,
          persons: {
            connectOrCreate: movie.persons.map((person) => {
              const { description, ...p } = person;
              return {
                where: { kpId: person.kpId },
                create: {
                  kpId: person.kpId,
                  movieKpId: movie.kpId,
                  description,
                  profession: person.profession,
                  person: {
                    connectOrCreate: {
                      where: { kpId: person.kpId },
                      create: {
                        ...p,
                      },
                    },
                  },
                },
              };
            }),
          },
        };
        return this.prisma.movie.upsert({
          where: { kpId: movie.kpId },
          create: data,
          update: data,
          include: { persons: true },
        });
      }),
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
      const movies$ = this.api.fundMovieAll({ limit, page }).pipe(
        map((movies) => movies.docs),
        switchAll(),
        map((movie) =>
          plainToInstance(KpToMovieDto, movie, {
            excludeExtraneousValues: true,
          })
        ),
        auditTime(100),
        tap((movie) => console.log('movie: ', movie.kpId)),
        map((movie) => {
          const persons$ = from(movie.persons).pipe(
            auditTime(100),
            tap((person) => console.log('person: ', person.kpId)),

            mergeMap((person) => {
              const { description, ...p } = person;

              return this.prisma.person.upsert({
                where: { kpId: person.kpId },
                create: {
                  ...p,
                },
                update: {
                  ...p,
                },
              });
            })
          );
          persons$.subscribe();
          return movie;
        }),
        mergeMap((movie) => {
          const data: Prisma.MovieCreateInput = {
            ...movie,
            persons: {
              connectOrCreate: movie.persons.map((person) => {
                const { description, ...p } = person;
                return {
                  where: { kpId: person.kpId },
                  create: {
                    kpId: person.kpId,
                    movieKpId: movie.kpId,
                    description,
                    profession: person.profession,
                    person: {
                      connectOrCreate: {
                        where: { kpId: person.kpId },
                        create: {
                          ...p,
                        },
                      },
                    },
                  },
                };
              }),
            },
          };
          return this.prisma.movie.upsert({
            where: { kpId: movie.kpId },
            create: data,
            update: data,
            include: { persons: true },
          });
        })
      );

      movies$.subscribe();
    });
    return { message: 'ok' };
  }

  @Get('find/:id')
  findById(@Param('id', ParseIntPipe) id: number): Promise<Movie> {
    return this.prisma.movie.findUnique({
      where: { kpId: id },
      include: { persons: true },
    });
  }

  @Get('find/all')
  findAll(
    @Query(TransformPipe) pagination: PaginationQueryDto,
    @Query(TransformPipe)
    query: SearchAllQueryDto<
      Prisma.MovieWhereInput,
      Prisma.Enumerable<Prisma.MovieOrderByWithRelationInput>
    >
  ): Observable<PaginationResponseDto<Movie>> {
    const { limit, page } = pagination;
    const args: Prisma.MovieFindManyArgs = {
      ...query,
      include: { persons: true },
      take: limit,
      skip: (page - 1) * limit,
    };

    return from(
      Promise.all([
        this.prisma.movie.findMany(args),
        this.prisma.movie.count({
          where: args.where,
        }),
      ])
    ).pipe(
      map(([docs, count]) => ({
        docs,
        count,
        page,
        pages: Math.floor(count / limit),
      }))
    );
  }
}
