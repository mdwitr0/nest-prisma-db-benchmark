import { KpToMovieDto, PaginationQueryDto, SearchAllQueryDto } from '@dto';
import { Injectable } from '@nestjs/common';
import { Movie, Prisma, PrismaMongodbService } from '@prisma/mongodb';
import { from, map } from 'rxjs';

@Injectable()
export class MovieService {
  constructor(private readonly prisma: PrismaMongodbService) {}

  async upsert(movie: KpToMovieDto): Promise<Movie> {
    const data: Prisma.MovieCreateInput = {
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
                  create: person,
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
  }

  findUnique(where: Prisma.MovieWhereUniqueInput) {
    return this.prisma.movie.findUnique({
      where,
      include: { persons: true },
    });
  }

  findMany(
    pagination: PaginationQueryDto,
    query: SearchAllQueryDto<
      Prisma.MovieWhereInput,
      Prisma.Enumerable<Prisma.MovieOrderByWithRelationInput>
    >
  ) {
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
