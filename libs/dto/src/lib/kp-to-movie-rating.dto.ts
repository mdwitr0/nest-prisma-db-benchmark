import { Rating } from '@kinopoiskdev-client';
import { MovieRating as PostgresMovieRating } from '@prisma/postgresql';
import { Expose } from 'class-transformer';
import { SetDefaultValue } from '@decorators';

export class KpToMovieRatingDto<T = Rating>
  implements Partial<PostgresMovieRating>, Partial<PostgresMovieRating>
{
  @Expose()
  @SetDefaultValue(null)
  kp: number | null;

  @Expose()
  @SetDefaultValue(null)
  imdb: number | null;

  @Expose()
  @SetDefaultValue(null)
  await: number | null;

  @Expose()
  @SetDefaultValue(null)
  filmCritics: number | null;

  @Expose()
  @SetDefaultValue(null)
  russianFilmCritics: number | null;

  @Expose()
  @SetDefaultValue(null)
  tmdb: number | null;

  constructor(partial: Partial<KpToMovieRatingDto<T>>) {
    Object.assign(this, partial);
  }
}
