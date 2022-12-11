import { KpToMoviePersonDto } from '@dto';
import { Injectable } from '@nestjs/common';
import { Person, PrismaPostgresqlService } from '@prisma/postgresql';
import { Span } from 'nestjs-otel';

@Injectable()
export class PersonService {
  constructor(private readonly prisma: PrismaPostgresqlService) {}

  @Span()
  async upsert(person: KpToMoviePersonDto): Promise<Person> {
    return this.prisma.person.upsert({
      where: { kpId: person.kpId },
      create: person,
      update: person,
    });
  }
}
