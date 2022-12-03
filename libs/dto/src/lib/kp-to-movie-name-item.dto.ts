import { Name } from '@kinopoiskdev-client';
import { MovieNameItem as PostgresMovieNameItem } from '@prisma/postgresql';
import { Expose } from 'class-transformer';

export class KpToMovieNameItemDto<T = Name>
  implements Partial<PostgresMovieNameItem>, Partial<PostgresMovieNameItem>
{
  @Expose()
  name: string;

  constructor(partial: Partial<KpToMovieNameItemDto<T>>) {
    Object.assign(this, partial);
  }
}
