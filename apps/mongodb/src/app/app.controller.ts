import { Controller, Get, Param, Post } from '@nestjs/common';

import { AppService } from './app.service';
import { Movie, MovieType, PrismaMongodbService } from '@prisma/mongodb';
import { faker } from '@faker-js/faker';
import {
  ApiClientModule,
  ApiClientService,
  Movie as KpMovie,
} from '@kinopoiskdev-client';
import { lastValueFrom } from 'rxjs';

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

  @Get('generate/one')
  async generateOne() {
    const genreNames = ['action', 'comedy', 'drama', 'horror', 'thriller'];
    const genres = () =>
      faker.helpers
        .shuffle(genreNames)
        .slice(0, faker.datatype.number({ min: 1, max: 3 }));
    faker.locale = 'ru';
    const name = faker.commerce.productName();
    faker.locale = 'en';
    const enName = faker.commerce.productName();

    const movie: Partial<Movie> = {
      kpId: faker.unique(faker.datatype.number),
      externalId: {
        imdb: faker.unique(faker.datatype.string),
        tmdb: faker.unique(faker.datatype.number),
        kpHD: faker.unique(faker.datatype.uuid),
      },
      name,
      enName,
      description: faker.commerce.productDescription(),
      year: faker.datatype.number({ min: 1900, max: 2021 }),
      type: faker.helpers.arrayElement(Object.values(MovieType)),
      genres: genres().map((genre) => ({ name: genre })),
      rating: {
        kp: faker.datatype.number({ min: 0, max: 10 }),
        imdb: faker.datatype.number({ min: 0, max: 10 }),
        tmdb: faker.datatype.number({ min: 0, max: 10 }),
        await: faker.datatype.number({ min: 0, max: 100000 }),
        filmCritics: faker.datatype.number({ min: 0, max: 10 }),
        russianFilmCritics: faker.datatype.number({ min: 0, max: 10 }),
      },
    };
    return movie;
    // return this.prisma.mongodb.create({ data });
  }

  @Get('create/:id')
  async create(@Param('id') id: number) {
    const movie = await lastValueFrom(this.api.findMovieById({ id }));

    return this.prisma.movie.create({
      data: {
        kpId: movie.id,
        externalId: {
          imdb: movie.externalId.imdb,
          tmdb: movie.externalId.tmdb,
          kpHD: movie.externalId.kpHd,
        },
        name: movie.name,
        enName: movie.enName,
        description: movie.description,
        year: movie.year,
        type: 'MOVIE',
        genres: movie.genres.map({ name: genre.name }),
        rating: movie.rating,
      },
    });
    // return this.prisma.mongodb.create({ data });
  }
}
