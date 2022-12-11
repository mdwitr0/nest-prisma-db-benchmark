import { MovieAdapter } from '@adapters';
import { QueueEnum, QueueProcess } from '@enum';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Span } from 'nestjs-otel';
import {
  catchError,
  map,
  mergeMap,
  switchAll,
  timeInterval,
  of,
  toArray,
} from 'rxjs';
import { MovieService } from './movie.service';

@Processor(QueueEnum.POSTGRES_MOVIE)
export class MovieProcessor {
  private readonly logger = new Logger(MovieProcessor.name);

  constructor(
    private readonly service: MovieService,
    private readonly movieClient: MovieAdapter
  ) {}

  @Span()
  @Process({ name: QueueProcess.POSTGRES_PARSE_PAGE })
  async parsePagesProcess(job: Job<{ page: number; limit: number }>) {
    const upserting$ = this.movieClient.findManyFromKp(job.data).pipe(
      map((res) => res.docs),
      switchAll(),
      mergeMap(async (movie) => await this.service.upsert(movie)),
      catchError((err) => {
        this.logger.error(err);
        return of(null);
      }),
      toArray()
    );

    upserting$.pipe(timeInterval()).subscribe((time) => {
      this.logger.log(
        `Update movies from ${job.data.page} page in ${time.interval}ms`
      );
    });
  }
}
