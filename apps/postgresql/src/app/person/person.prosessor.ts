import { PersonAdapter } from '@adapters';
import { QueueEnum, QueueProcess } from '@enum';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { lastValueFrom, map } from 'rxjs';
import { PersonService } from './person.service';

@Processor(QueueEnum.POSTGRES_PERSON)
export class PersonProcessor {
  private readonly logger = new Logger(PersonProcessor.name);

  constructor(
    private readonly service: PersonService,
    private readonly personClient: PersonAdapter
  ) {}

  @Process({ name: QueueProcess.POSTGRES_PARSE_PAGE })
  async parsePagesProcess(job: Job<{ page: number; limit: number }>) {
    const persons = await lastValueFrom(
      this.personClient.findManyFromKp(job.data).pipe(map((res) => res.docs))
    );
    const start = Date.now();
    await this.service.upsertMany(persons);

    this.logger.log(
      `Update persons ${persons.length} from ${job.data.page} page in ${
        Date.now() - start
      } ms`
    );
  }
}
