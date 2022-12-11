import { Controller, Get, Query } from '@nestjs/common';

import { PersonAdapter } from '@adapters';
import { CreatePaginationQueryDto } from '@dto';
import { QueueEnum, QueueProcess } from '@enum';
import { InjectQueue } from '@nestjs/bull';
import { TransformPipe } from '@pipes';
import { Queue } from 'bull';
import { range } from 'rxjs';
import { PersonService } from './person.service';
import { Span } from 'nestjs-otel';

@Controller('person')
export class PersonController {
  constructor(
    private readonly service: PersonService,
    private readonly personClient: PersonAdapter,
    @InjectQueue(QueueEnum.MONGO_PERSON) private readonly queue: Queue
  ) {}

  @Span()
  @Get('upsert')
  upsert(@Query(TransformPipe) pagination: CreatePaginationQueryDto): {
    message: string;
  } {
    const { limit, page, end } = pagination;
    range(page, end).subscribe((page) => {
      this.queue.add(QueueProcess.MONGO_PARSE_PAGE, {
        limit,
        page,
        field: ['id'],
        search: ['1-9999999999999'],
      });
    });
    return { message: 'ok' };
  }
}
