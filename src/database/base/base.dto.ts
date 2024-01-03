import { plainToClass } from 'class-transformer';

export abstract class BaseDTO {
  static plainToClass<T>(this: new (...args: any[]) => T, obj: T): T {
    const instance = plainToClass(this, obj, { excludeExtraneousValues: true });

    Object.keys(instance).forEach(
      (key) => instance[key] === undefined && delete instance[key],
    );

    return instance;
  }
}
