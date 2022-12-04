import { Transform } from 'class-transformer';

export const ParseJson = () =>
  Transform(({ value }) => {
    return value ? JSON.parse(value) : value;
  });
