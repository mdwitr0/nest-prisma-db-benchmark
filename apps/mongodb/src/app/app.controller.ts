import { Controller, Get, Param } from '@nestjs/common';

import { AppService } from './app.service';
import { Movie, PrismaMongodbService } from '@prisma/mongodb';
import { ApiClientService } from '@kinopoiskdev-client';
import { map, mergeMap, Observable } from 'rxjs';
import { KpToMovieDto } from '@dto';
import { plainToInstance } from 'class-transformer';

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
          data: movie,
        })
      )
    );
  }

  @Get('find/:id')
  findById(@Param('id') id: number): Promise<Movie> {
    return this.prisma.movie.findUnique({
      where: { kpId: id },
      include: { persons: true },
    });
  }
}
