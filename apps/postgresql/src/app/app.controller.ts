import { Controller, Get, Param } from '@nestjs/common';

import { AppService } from './app.service';
import { PrismaPostgresqlService } from '@prisma/postgresql';
import { map, mergeMap, Observable } from 'rxjs';
import { Movie } from '@prisma/postgresql';
import { plainToInstance } from 'class-transformer';
import { KpToMovieDto } from '@dto';
import { ApiClientService } from '@kinopoiskdev-client';

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

  @Get('find/:id')
  findById(@Param('id') id: number): Promise<Movie> {
    return this.prisma.movie.findUnique({
      where: { kpId: id },
      include: { genres: true, rating: true, externalId: true, persons: true },
    });
  }
}
