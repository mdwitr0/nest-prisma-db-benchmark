import { ExternalId as KpExternalId } from '@kinopoiskdev-client';
import { MovieExternalId as MongoMovieExternalId } from '@prisma/mongodb';
import { MovieExternalId as PostgresMovieExternalId } from '@prisma/postgresql';
import { SetDefaultValue, ParseValue } from '@decorators';
import { Expose } from 'class-transformer';

export class KpToExternalIdDto<T = KpExternalId>
  implements Partial<MongoMovieExternalId>, Partial<PostgresMovieExternalId>
{
  @Expose()
  @SetDefaultValue(null)
  imdb: string | null;

  @Expose()
  @SetDefaultValue(null)
  tmdb: number | null;

  @Expose()
  @SetDefaultValue(null)
  kpHD: string | null;

  constructor(partial: Partial<KpToExternalIdDto<T>>) {
    Object.assign(this, partial);
  }
}
