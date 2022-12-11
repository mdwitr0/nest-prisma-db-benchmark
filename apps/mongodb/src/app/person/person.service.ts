import { KpToMoviePersonDto } from '@dto';
import { Injectable } from '@nestjs/common';
import { Person, PrismaMongodbService } from '@prisma/mongodb';
import { Span } from 'nestjs-otel';

@Injectable()
export class PersonService {
  constructor(private readonly prisma: PrismaMongodbService) {}

  @Span()
  async upsert(person: KpToMoviePersonDto): Promise<Person> {
    return this.prisma.person.upsert({
      where: { kpId: person.kpId },
      create: person,
      update: person,
    });
  }
}
