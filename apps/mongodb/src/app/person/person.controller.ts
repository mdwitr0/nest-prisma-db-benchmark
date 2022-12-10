import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { PersonService } from './person.service';
import { Movie, Prisma, PrismaMongodbService } from '@prisma/mongodb';
import {
  catchError,
  delay,
  from,
  map,
  mergeMap,
  Observable,
  of,
  range,
  switchAll,
  tap,
  toArray,
} from 'rxjs';
import {
  CreatePaginationQueryDto,
  PaginationQueryDto,
  PaginationResponseDto,
  SearchAllQueryDto,
} from '@dto';
import { TransformPipe } from '@pipes';
import { MovieAdapter, PersonAdapter } from '@adapters';

@Controller()
export class PersonController {
  constructor(
    private readonly service: PersonService,
    private readonly prisma: PrismaMongodbService,
    private readonly movieClient: MovieAdapter,
    private readonly personClient: PersonAdapter
  ) {}

  @Get('upsert')
  upsertPersons(@Query(TransformPipe) pagination: CreatePaginationQueryDto): {
    message: string;
  } {
    const { limit, page, end } = pagination;
    console.log(limit, page, end);
    const range$ = range(page, end - page).pipe(
      mergeMap((page) => of(page).pipe(delay(page * 100)))
    );

    range$.subscribe((page) => {
      const pesons$ = this.personClient
        .findManyFromKp({
          limit,
          page,
          field: ['id'],
          search: ['1-9999999999999'],
        })
        .pipe(mergeMap((res) => res.docs));

      pesons$.subscribe(async (person) => {
        await this.service.upsert(person);
      });
    });
    return { message: 'ok' };
  }
}
