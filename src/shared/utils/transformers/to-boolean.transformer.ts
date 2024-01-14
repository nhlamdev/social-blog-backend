import { TransformFnParams } from 'class-transformer/types/interfaces';
import { MaybeType } from '../types/maybe.type';

export const toBooleanTransformer = (
  params: TransformFnParams,
): MaybeType<boolean> => {
  const { value } = params;
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return false;
};
