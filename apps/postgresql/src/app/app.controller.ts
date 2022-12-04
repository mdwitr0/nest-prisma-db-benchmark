import {Controller, Get, Param, Query} from '@nestjs/common';

import {AppService} from './app.service';
import {Movie, PrismaPostgresqlService} from '@prisma/postgresql';
import {from, map, mergeMap, Observable, range, switchAll,} from 'rxjs';
import {plainToInstance} from 'class-transformer';
import {CreatePaginationQueryDto, KpToMovieDto,} from '@dto';
import {ApiClientService} from '@kinopoiskdev-client';
import {TransformPipe} from '@pipes';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaPostgresqlService,
    private readonly api: ApiClientService
  ) {}

  @Get('metrics')
  async metrics() {
    return this.prisma.$metrics.prometheus({
      globalLabels: { app: 'postgresql' },
    });
  }

  @Get('create/:id')
  create(@Param('id') id: number): Observable<Movie> {
    const movie$ = this.api.findMovieById({ id }).pipe(
      map((movie) =>
        plainToInstance(KpToMovieDto, movie, {
          excludeExtraneousValues: true,
        })
      )
    );
    return movie$.pipe(
      mergeMap((movie) =>
        this.prisma.movie.create({
          data: {
            ...movie,
            rating: {
              create: {
                ...movie.rating,
              },
            },
            externalId: {
              create: {
                ...movie.externalId,
              },
            },
            genres: {
              connectOrCreate: movie.genres.map((genre) => ({
                where: { name: genre.name },
                create: { ...genre },
              })),
            },
          },
          include: {
            genres: true,
            rating: true,
            externalId: true,
            persons: true,
          },
        })
      )
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
        mergeMap((movie) => {
          return from(
            this.prisma.movie.findUnique({
              where: { kpId: movie.kpId },
            })
          ).pipe(
            mergeMap((movieFromDb) => {
              if (movieFromDb) {
                return this.prisma.movie.update({
                  where: { kpId: movie.kpId },
                  data: {
                    ...movie,
                    rating: {
                      update: {
                        ...movie.rating,
                      },
                    },
                    externalId: {
                      update: {
                        ...movie.externalId,
                      },
                    },
                    genres: {
                      upsert: movie.genres.map((genre) => ({
                        where: { name: genre.name },
                        create: { ...genre },
                        update: { ...genre },
                      })),
                    },
                  },
                  include: {
                    persons: true,
                    genres: true,
                    rating: true,
                    externalId: true,
                  },
                });
              } else {
                return this.prisma.movie.create({
                  data: {
                    ...movie,
                    rating: {
                      create: {
                        ...movie.rating,
                      },
                    },
                    externalId: {
                      create: {
                        ...movie.externalId,
                      },
                    },
                    genres: {
                      connectOrCreate: movie.genres.map((genre) => ({
                        where: { name: genre.name },
                        create: { ...genre },
                      })),
                    },
                  },
                  include: {
                    genres: true,
                    rating: true,
                    externalId: true,
                    persons: true,
                  },
                });
              }
            })
          );
        })
      );

      movies$.subscribe();
    });
    return { message: 'ok' };
  }

  @Get('find/:id')
  findById(@Param('id') id: number): Promise<Movie> {
    return this.prisma.movie.findUnique({
      where: { kpId: id },
      include: { genres: true, rating: true, externalId: true, persons: true },
    });
  }
}
