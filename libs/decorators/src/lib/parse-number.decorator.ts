import { Transform } from 'class-transformer';

export const ParseNumber = () =>
  Transform(({ value }) => {
    return value === 'string' ? Number(value) : value;
  });
