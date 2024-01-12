import { TransformFnParams } from 'class-transformer/types/interfaces';
import { MaybeType } from '../types/maybe.type';

export const searchFormatTransformer = (
  params: TransformFnParams,
): MaybeType<string> => {
  const { value } = params;

  const transform = value
    ? `%${value
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')}%`
    : '%%';

  return transform;
};
