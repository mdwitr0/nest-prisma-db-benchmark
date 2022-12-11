import { MovieAdapter } from '@adapters';
import { QueueEnum, QueueProcess } from '@enum';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { map, mergeMap, switchAll, timeInterval } from 'rxjs';
import { MovieService } from './movie.service';

@Processor(QueueEnum.POSTGRES_MOVIE)
export class MovieProcessor {
  private readonly logger = new Logger(MovieProcessor.name);

  constructor(
    private readonly service: MovieService,
    private readonly movieClient: MovieAdapter
  ) {}

  @Process({ name: QueueProcess.POSTGRES_PARSE_PAGE, concurrency: 10 })
  async parsePagesProcess(job: Job<{ page: number; limit: number }>) {
    this.logger.log(`Parsing pages ${job.data.page}`);
    const upserting$ = this.movieClient.findManyFromKp(job.data).pipe(
      map((res) => res.docs),
      switchAll(),
      mergeMap(async (movie) => await this.service.upsert(movie))
    );

    upserting$.pipe(timeInterval()).subscribe((time) => {
      this.logger.log(`Upserted person in ${time.interval}ms`);
    });
  }
}
