import { Controller, Get, Param, Post } from '@nestjs/common';

import { AppService } from './app.service';
import { Movie, MovieType, PrismaMongodbService } from '@prisma/mongodb';
import { faker } from '@faker-js/faker';
import {
  ApiClientModule,
  ApiClientService,
  Movie as KpMovie,
} from '@kinopoiskdev-client';
import { lastValueFrom, map } from 'rxjs';
import { KpToMovieDto } from '../../../../libs/dto/src/lib/kp-to-movie.dto';
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
  async create(@Param('id') id: number) {
    const movie$ = this.api
      .findMovieById({ id })
      .pipe(
        map((movie) =>
          plainToInstance(KpToMovieDto, movie, {
            excludeExtraneousValues: true,
          })
        )
      );
    const movie = await lastValueFrom(movie$);
    return this.prisma.movie.create({
      data: movie,
    });
    // return this.prisma.mongodb.create({ data });
  }
}
