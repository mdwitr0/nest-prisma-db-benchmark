import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TransformPipe<I, T> implements PipeTransform<I, T> {
  transform(value: I, { metatype }: ArgumentMetadata): T {
    return plainToInstance(metatype, value);
  }
}
