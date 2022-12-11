import { KpToMoviePersonDto } from '@dto';
import { ApiClientService, Person } from '@kinopoiskdev-client';
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Observable, map } from 'rxjs';
import { Span } from 'nestjs-otel';

export interface PersonRequest {
  field?: string[];
  search?: string[];
  sortField?: string[];
  sortType?: string[];
  page?: number;
  limit?: number;
}

export type PersonPaginatedResponse = {
  docs: KpToMoviePersonDto[];
  total: number;
  limit: number;
  page: number;
  pages: number;
};

@Injectable()
export class PersonAdapter {
  constructor(private readonly api: ApiClientService) {}

  @Span()
  findByIdFromKp(id: number): Observable<KpToMoviePersonDto> {
    return this.api
      .findPersonById({ id })
      .pipe(map((person) => this.painToInstance(person)));
  }

  @Span()
  findManyFromKp(request: PersonRequest): Observable<PersonPaginatedResponse> {
    return this.api.findManyPersons(request).pipe(
      map((res) => ({
        ...res,
        docs: res.docs.map((person) => this.painToInstance(person)),
      }))
    );
  }

  painToInstance(person: Person) {
    return plainToInstance(KpToMoviePersonDto, person, {
      excludeExtraneousValues: true,
    });
  }
}
