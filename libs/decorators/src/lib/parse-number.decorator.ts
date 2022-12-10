import { Transform } from 'class-transformer';

export const ParseNumber = () =>
  Transform(({ value }) => {
    return Number(value) || value;
  });
