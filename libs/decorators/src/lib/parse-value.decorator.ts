import { Transform } from 'class-transformer';
import { getValueByPath } from '@utils';

export const ParseValue = (keys: string[] = []) =>
  Transform(({ key, obj }) => {
    for (const prop of [key].concat(keys)) {
      const foundValue = getValueByPath(prop, obj);
      if (foundValue) return foundValue;
    }
  });
