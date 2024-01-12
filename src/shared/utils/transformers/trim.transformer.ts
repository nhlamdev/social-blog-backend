import { TransformFnParams } from 'class-transformer/types/interfaces';
import { MaybeType } from '../types/maybe.type';

export const trimTransformer = (params: TransformFnParams): MaybeType<string> =>
  params.value?.trim();
