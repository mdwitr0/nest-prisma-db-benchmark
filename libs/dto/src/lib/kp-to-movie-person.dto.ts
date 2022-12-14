import { Person } from '@kinopoiskdev-client';
import {
  Person as PostgresPerson,
  ProfessionType as PostgresProfessionType,
  PersonSex as PostgresPersonSex,
} from '@prisma/postgresql';
import { Expose, Transform } from 'class-transformer';
import { ParseValue, SetDefaultValue } from '@decorators';
import {
  ProfessionType as MongoProfessionType,
  PersonSex as MongoPersonSex,
} from '@prisma/mongodb';
import { faker } from '@faker-js/faker';
import { KpGenderToMovieEnum } from '@enum';

export class KpToMoviePersonDto<T = Person>
  implements Partial<PostgresPerson>, Partial<PostgresPerson>
{
  @Expose()
  @ParseValue(['id'])
  kpId: number;

  @Expose()
  @SetDefaultValue(null)
  name: string;

  @Expose()
  @SetDefaultValue(null)
  enName: string;

  @Expose()
  @Transform(({ value }) => KpGenderToMovieEnum[value] || MongoPersonSex.MALE)
  sex: PostgresPersonSex | MongoPersonSex;

  @Expose()
  @Transform(() =>
    faker.helpers.arrayElement(Object.values(MongoProfessionType))
  )
  profession: (MongoProfessionType | PostgresProfessionType)[];

  @Expose()
  @SetDefaultValue(faker.datatype.number({ min: 1, max: 100 }))
  age: number;

  @Expose()
  @SetDefaultValue(faker.datatype.number({ min: 1, max: 100 }))
  countAwards: number;

  @Expose()
  @SetDefaultValue(faker.datatype.number({ min: 100, max: 210 }))
  growth: number;

  @Expose()
  @SetDefaultValue(faker.date.birthdate())
  birthday: Date | null;

  @Expose()
  @SetDefaultValue(null)
  death: Date | null;

  constructor(partial: Partial<KpToMoviePersonDto<T>>) {
    Object.assign(this, partial);
  }
}
