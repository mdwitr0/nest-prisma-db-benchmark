import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { AppService } from './app.service';
import { Movie, Prisma, PrismaMongodbService } from '@prisma/mongodb';
import { ApiClientService } from '@kinopoiskdev-client';
import { from, map, mergeMap, Observable, range, switchAll } from 'rxjs';
import {KpToMovieDto, PaginationQueryDto, SearchAllQueryDto} from '@dto';
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
  createOrUpdate(@Param('id') id: number): Observable<Movie> {
    return this.api.findMovieById({ id }).pipe(
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
                data: movie,
                include: { persons: true },
              });
            } else {
              return this.prisma.movie.create({
                data: movie,
                include: { persons: true },
              });
            }
          })
        );
      })
    );
  }

  @Get('create-or-update/all/:limit(\\d+)/:start(\\d+)/:end(\\d+)')
  createOrUpdateAll(
    @Param('limit', ParseIntPipe) limit: number,
    @Param('start', ParseIntPipe) start: number,
    @Param('end', ParseIntPipe) end: number
  ): { message: string } {
    const range$ = range(start, end);

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
                  data: movie,
                  include: { persons: true },
                });
              } else {
                return this.prisma.movie.create({
                  data: movie,
                  include: { persons: true },
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
      include: { persons: true },
    });
  }

  @Get('find/all/:limit(\\d+)/:page(\\d+)')
  findAll(
    @Query() pagination: PaginationQueryDto,
    @Query(TransformPipe)
    query: SearchAllQueryDto<
      Prisma.MovieWhereInput,
      Prisma.Enumerable<Prisma.MovieOrderByWithRelationInput>
    >
  ): Observable<{
    docs: Movie[];
    count: number;
    page: number;
    pages: number;
  }> {
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
