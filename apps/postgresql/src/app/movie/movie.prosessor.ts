import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { QueueEnum, QueueProcess } from '@enum';
import { map, mergeMap, switchAll } from 'rxjs';
import { MovieAdapter } from '@adapters';
import { MovieService } from './movie.service';

@Processor(QueueEnum.POSTGRES_MOVIE)
export class MovieProcessor {
  private readonly logger = new Logger(MovieProcessor.name);

  constructor(
    private readonly service: MovieService,
    private readonly movieClient: MovieAdapter,
    @InjectQueue(QueueEnum.POSTGRES_MOVIE) private readonly queue: Queue
  ) {}

  @Process({ name: QueueProcess.POSTGRES_UPSERT, concurrency: 10 })
  async upsertProcess(job: Job) {
    this.logger.log(`Upserting movie ${JSON.stringify(job.data.data.kpId)}`);
    await this.service.upsert(job.data.data);
  }

  @Process({ name: QueueProcess.POSTGRES_PARSE_PAGE, concurrency: 10 })
  async parsePagesProcess(job: Job<{ page: number; limit: number }>) {
    this.logger.log(`Parsing pages ${job.data.page}`);
    this.movieClient
      .findManyFromKp(job.data)
      .pipe(
        map((res) => res.docs),
        switchAll(),
        mergeMap((movie) =>
          this.queue.add(QueueProcess.POSTGRES_UPSERT, { data: movie })
        )
      )
      .subscribe();
  }
}
