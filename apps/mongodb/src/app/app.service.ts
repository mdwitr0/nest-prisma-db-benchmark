import { KpToMovieDto, KpToMoviePersonDto } from '@dto';
import { Injectable } from '@nestjs/common';
import { Movie, Person, Prisma, PrismaMongodbService } from '@prisma/mongodb';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaMongodbService) {}

  async upsertMovie(movie: KpToMovieDto): Promise<Movie> {
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

  async upsertPerson(person: KpToMoviePersonDto): Promise<Person> {
    return this.prisma.person.upsert({
      where: { kpId: person.kpId },
      create: person,
      update: person,
    });
  }
}
