import { KpToMoviePersonDto } from '@dto';
import { Injectable } from '@nestjs/common';
import { Person, PrismaMongodbService } from '@prisma/mongodb';

@Injectable()
export class PersonService {
  constructor(private readonly prisma: PrismaMongodbService) {}

  async upsert(person: KpToMoviePersonDto): Promise<Person> {
    return this.prisma.person.upsert({
      where: { kpId: person.kpId },
      create: person,
      update: person,
    });
  }
}
