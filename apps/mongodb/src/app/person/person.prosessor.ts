import { PersonAdapter } from '@adapters';
import { QueueEnum, QueueProcess } from '@enum';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { map, mergeMap, switchAll } from 'rxjs';
import { PersonService } from './person.service';

@Processor(QueueEnum.PERSON)
export class PersonProcessor {
  private readonly logger = new Logger(PersonProcessor.name);

  constructor(
    private readonly service: PersonService,
    private readonly personClient: PersonAdapter,
    @InjectQueue(QueueEnum.PERSON) private readonly queue: Queue
  ) {}

  @Process(QueueProcess.UPSERT)
  async upsertProcess(job: Job) {
    this.logger.log(`Upserting person ${JSON.stringify(job.data.data.kpId)}`);
    await this.service.upsert(job.data.data);
  }

  @Process(QueueProcess.PARSE_PAGE)
  async parsePagesProcess(job: Job<{ page: number; limit: number }>) {
    this.logger.log(`Parsing pages ${job.data.page}`);
    this.personClient
      .findManyFromKp(job.data)
      .pipe(
        map((res) => res.docs),
        switchAll(),
        mergeMap((movie) =>
          this.queue.add(QueueProcess.UPSERT, { data: movie })
        )
      )
      .subscribe();
  }
}
