import { PersonAdapter } from '@adapters';
import { QueueEnum, QueueProcess } from '@enum';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { map, mergeMap, switchAll } from 'rxjs';
import { PersonService } from './person.service';

@Processor(QueueEnum.MONGO_PERSON)
export class PersonProcessor {
  private readonly logger = new Logger(PersonProcessor.name);

  constructor(
    private readonly service: PersonService,
    private readonly personClient: PersonAdapter,
    @InjectQueue(QueueEnum.MONGO_PERSON) private readonly queue: Queue
  ) {}

  @Process({ name: QueueProcess.MONGO_UPSERT, concurrency: 5 })
  async upsertProcess(job: Job) {
    this.logger.log(`Upserting person ${JSON.stringify(job.data.data.kpId)}`);
    await this.service.upsert(job.data.data);
  }

  @Process({ name: QueueProcess.MONGO_PARSE_PAGE, concurrency: 5 })
  async parsePagesProcess(job: Job<{ page: number; limit: number }>) {
    this.logger.log(`Parsing pages ${job.data.page}`);
    this.personClient
      .findManyFromKp(job.data)
      .pipe(
        map((res) => res.docs),
        switchAll(),
        mergeMap((movie) =>
          this.queue.add(QueueProcess.MONGO_UPSERT, { data: movie })
        )
      )
      .subscribe();
  }
}
