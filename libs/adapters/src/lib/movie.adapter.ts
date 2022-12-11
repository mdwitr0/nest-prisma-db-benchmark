import { KpToMovieDto } from '@dto';
import { ApiClientService, Movie } from '@kinopoiskdev-client';
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Span } from 'nestjs-otel';
import { Observable, map } from 'rxjs';

export interface MovieRequest {
  field?: string[];
  search?: string[];
  sortField?: string[];
  sortType?: string[];
  page?: number;
  limit?: number;
}

export type MoviePaginatedResponse = {
  docs: KpToMovieDto[];
  total: number;
  limit: number;
  page: number;
  pages: number;
};

@Injectable()
export class MovieAdapter {
  constructor(private readonly api: ApiClientService) {}

  @Span()
  findByIdFromKp(id: number): Observable<KpToMovieDto> {
    return this.api
      .findMovieById({ id })
      .pipe(map((movie) => this.paintToInstance(movie)));
  }

  @Span()
  findManyFromKp(request: MovieRequest): Observable<MoviePaginatedResponse> {
    return this.api.findManyMovies(request).pipe(
      map((res) => ({
        ...res,
        docs: res.docs.map((movie) => this.paintToInstance(movie)),
      }))
    );
  }

  paintToInstance(movie: Movie) {
    return plainToInstance(KpToMovieDto, movie, {
      excludeExtraneousValues: true,
    });
  }
}
