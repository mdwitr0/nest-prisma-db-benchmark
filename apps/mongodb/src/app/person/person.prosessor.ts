import { PersonAdapter } from '@adapters';
import { QueueEnum, QueueProcess } from '@enum';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Span } from 'nestjs-otel';
import { map, mergeMap, switchAll, timeInterval, toArray } from 'rxjs';
import { PersonService } from './person.service';

@Processor(QueueEnum.MONGO_PERSON)
export class PersonProcessor {
  private readonly logger = new Logger(PersonProcessor.name);

  constructor(
    private readonly service: PersonService,
    private readonly personClient: PersonAdapter
  ) {}

  @Span()
  @Process({ name: QueueProcess.MONGO_PARSE_PAGE, concurrency: 5 })
  async parsePagesProcess(job: Job<{ page: number; limit: number }>) {
    const upserting$ = this.personClient.findManyFromKp(job.data).pipe(
      map((res) => res.docs),
      switchAll(),
      mergeMap(async (movie) => await this.service.upsert(movie)),
      toArray()
    );

    upserting$.pipe(timeInterval()).subscribe((time) => {
      this.logger.log(
        `Update persons from ${job.data.page} page in ${time.interval}ms`
      );
    });
  }
}
