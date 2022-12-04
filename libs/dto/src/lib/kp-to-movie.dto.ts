import { Movie as KpMovie } from '@kinopoiskdev-client';
import {
  Movie as MongoMovie,
  MovieType as MongoMovieType,
} from '@prisma/mongodb';
import {
  Movie as PostgresMovie,
  MovieType as PostgresMovieType,
} from '@prisma/postgresql';
import { SetDefaultValue, ParseValue } from '@decorators';
import { Expose, Transform, Type } from 'class-transformer';
import { KpTypesToMovieEnum } from '@enum';
import { KpToMovieNameItemDto } from './kp-to-movie-name-item.dto';
import { KpToMovieRatingDto } from './kp-to-movie-rating.dto';
import { KpToExternalIdDto } from './kp-to-movie-external-id.dto';

export class KpToMovieDto<T = KpMovie>
  implements Partial<MongoMovie>, Partial<PostgresMovie>
{
  @Expose()
  @ParseValue(['id'])
  kpId: number;

  @Expose()
  @SetDefaultValue(null)
  name: string | null;

  @Expose()
  @SetDefaultValue(null)
  enName: string | null;

  @Expose()
  @SetDefaultValue([])
  @Transform(({ value }) => value?.map((item) => item.name))
  names: string[];

  @Expose()
  @SetDefaultValue(null)
  year: number | null;

  @Expose()
  @SetDefaultValue(null)
  description: string | null;

  @Expose()
  @SetDefaultValue(null)
  @Transform(({ value }) => KpTypesToMovieEnum[value])
  type: PostgresMovieType | MongoMovieType;

  @Expose()
  @SetDefaultValue([])
  @Type(() => KpToMovieNameItemDto)
  genres: KpToMovieNameItemDto[];

  @Expose()
  @Type(() => KpToMovieRatingDto)
  rating: KpToMovieRatingDto;

  @Expose()
  @SetDefaultValue(null)
  @Type(() => KpToExternalIdDto)
  externalId: KpToExternalIdDto;

  constructor(partial: Partial<KpToMovieDto<T>>) {
    Object.assign(this, partial);
  }
}
