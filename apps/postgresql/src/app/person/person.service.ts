import { KpToMoviePersonDto } from '@dto';
import { Injectable } from '@nestjs/common';
import { Person, PrismaPostgresqlService } from '@prisma/postgresql';

@Injectable()
export class PersonService {
  constructor(private readonly prisma: PrismaPostgresqlService) {}

  async upsert(person: KpToMoviePersonDto): Promise<Person> {
    return this.prisma.person.upsert({
      where: { kpId: person.kpId },
      create: person,
      update: person,
    });
  }

  async upsertMany(persons: KpToMoviePersonDto[]): Promise<void> {
    this.prisma.$transaction([
      this.prisma.person.deleteMany({
        where: {
          kpId: {
            in: persons.map((p) => p.kpId),
          },
        },
      }),
      this.prisma.person.createMany({ data: persons }),
    ]);
  }
}
