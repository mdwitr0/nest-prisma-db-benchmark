import { KpToMovieDto, PaginationQueryDto, SearchAllQueryDto } from '@dto';
import { Injectable } from '@nestjs/common';
import { Movie, Prisma, PrismaPostgresqlService } from '@prisma/postgresql';
import { Span } from 'nestjs-otel';
import { from, map } from 'rxjs';

@Injectable()
export class MovieService {
  constructor(private readonly prisma: PrismaPostgresqlService) {}

  @Span()
  async upsert(movie: KpToMovieDto): Promise<Movie> {
    const data: Omit<
      Prisma.MovieCreateInput,
      'rating' | 'externalId' | 'genres'
    > = {
      ...movie,
      persons: {
        connectOrCreate: movie.persons.map((person) => {
          return {
            where: { kpId: person.kpId },
            create: {
              kpId: person.kpId,
              movieKpId: movie.kpId,
              profession: person.profession,
              person: {
                connectOrCreate: {
                  where: { kpId: person.kpId },
                  create: {
                    ...person,
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
      create: {
        ...data,
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
      update: {
        ...data,
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
      include: { persons: true },
    });
  }

  @Span()
  findUnique(where: Prisma.MovieWhereUniqueInput) {
    return this.prisma.movie.findUnique({
      where,
      include: { genres: true, rating: true, externalId: true, persons: true },
    });
  }

  @Span()
  findMany(
    pagination: PaginationQueryDto,
    query: SearchAllQueryDto<
      Prisma.MovieWhereInput,
      Prisma.Enumerable<Prisma.MovieOrderByWithRelationAndSearchRelevanceInput>
    >
  ) {
    const { limit, page } = pagination;
    const args: Prisma.MovieFindManyArgs = {
      ...query,
      include: { genres: true, rating: true, externalId: true, persons: true },
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
