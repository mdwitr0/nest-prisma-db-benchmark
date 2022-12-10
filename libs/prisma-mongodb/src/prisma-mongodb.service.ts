import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from './generated/client';
import { retryMiddleware } from './retry.middleware';

@Injectable()
export class PrismaMongodbService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    this.$use(async () => retryMiddleware);
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
